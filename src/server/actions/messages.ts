"use server";

import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { and, desc, eq, inArray, lt, or } from "drizzle-orm";

import { db } from "@/db";
import {
  messageReactions,
  messages,
  profiles,
  roomMembers,
  rooms,
} from "@/db/schema";
import { sendMessageAj } from "@/lib/arcjet";
import { getSafeAvatarUrl } from "@/lib/avatar";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import { protectWithArcjet } from "@/server/actions/arcjet-protection";
import {
  getMessagesForRoomSchema,
  messageIdSchema,
  sendMessageSchema,
  updateMessageSchema,
  type GetMessagesForRoomInput,
  type MessageIdInput,
  type SendMessageInput,
  type UpdateMessageInput,
} from "@/server/validators/chat";
import type {
  ChatMessage,
  ChatMessagePageInfo,
  ChatMessageReactionSummary,
} from "@/types/chat";

const DEFAULT_MESSAGE_PAGE_SIZE = 30;

async function protectSendMessageAction(userId: string) {
  return protectWithArcjet({
    actionName: "send_message",
    deniedMessage:
      "You are sending messages too fast. Please slow down for a moment.",
    failureMode: "fail-open",
    getDecision: async () => {
      const req = await request();
      return sendMessageAj.protect(req, {
        userId,
      });
    },
    userId,
  });
}

async function isRoomMember(roomId: string, userId: string) {
  const [membership] = await db
    .select({
      id: roomMembers.id,
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
    .where(
      and(
        eq(roomMembers.roomId, roomId),
        eq(roomMembers.userId, userId),
        eq(rooms.isArchived, false),
      ),
    )
    .limit(1);

  return Boolean(membership);
}

async function getOwnedMessageForMutation(messageId: string, userId: string) {
  const [message] = await db
    .select({
      id: messages.id,
      roomId: messages.roomId,
      userId: messages.userId,
    })
    .from(messages)
    .innerJoin(
      roomMembers,
      and(
        eq(roomMembers.roomId, messages.roomId),
        eq(roomMembers.userId, userId),
      ),
    )
    .innerJoin(rooms, eq(messages.roomId, rooms.id))
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.userId, userId),
        eq(rooms.isArchived, false),
      ),
    )
    .limit(1);

  return message ?? null;
}

function buildReactionMap(
  reactionRows: Array<{
    messageId: string;
    userId: string;
    emoji: string;
  }>,
  currentUserId: string,
) {
  const byMessageId = new Map<string, Map<string, ChatMessageReactionSummary>>();

  for (const reaction of reactionRows) {
    const emojiMap = byMessageId.get(reaction.messageId) ?? new Map();

    const existing =
      emojiMap.get(reaction.emoji) ??
      {
        emoji: reaction.emoji,
        count: 0,
        reactedByCurrentUser: false,
      };

    existing.count += 1;

    if (reaction.userId === currentUserId) {
      existing.reactedByCurrentUser = true;
    }

    emojiMap.set(reaction.emoji, existing);
    byMessageId.set(reaction.messageId, emojiMap);
  }

  return byMessageId;
}

function getReactionsForMessage(
  reactionMap: Map<string, Map<string, ChatMessageReactionSummary>>,
  messageId: string,
) {
  return Array.from(reactionMap.get(messageId)?.values() ?? []).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.emoji.localeCompare(b.emoji);
  });
}

export async function getMessagesForRoom(
  input: string | GetMessagesForRoomInput,
): Promise<
  ActionResponse<{ messages: ChatMessage[]; pageInfo: ChatMessagePageInfo }>
> {
  const actionInput = typeof input === "string" ? { roomId: input } : input;

  return withAuthedValidatedInput(
    getMessagesForRoomSchema,
    actionInput,
    async ({ input, user }) => {
      const canAccessRoom = await isRoomMember(input.roomId, user.id);

      if (!canAccessRoom) {
        return actionError(
          "FORBIDDEN",
          "Join this room before viewing messages.",
        );
      }

      const cursorCreatedAt = input.cursor
        ? new Date(input.cursor.createdAt)
        : null;
      const cursorPredicate =
        input.cursor && cursorCreatedAt
          ? or(
              lt(messages.createdAt, cursorCreatedAt),
              and(
                eq(messages.createdAt, cursorCreatedAt),
                lt(messages.id, input.cursor.id),
              ),
            )
          : undefined;
      const limit = input.limit ?? DEFAULT_MESSAGE_PAGE_SIZE;
      const fetchedRows = await db
        .select({
          id: messages.id,
          roomId: messages.roomId,
          userId: messages.userId,
          replyToMessageId: messages.replyToMessageId,
          content: messages.content,
          isEdited: messages.isEdited,
          createdAt: messages.createdAt,
          updatedAt: messages.updatedAt,
          authorId: profiles.id,
          authorUsername: profiles.username,
          authorAvatarUrl: profiles.avatarUrl,
        })
        .from(messages)
        .innerJoin(profiles, eq(messages.userId, profiles.id))
        .where(
          cursorPredicate
            ? and(eq(messages.roomId, input.roomId), cursorPredicate)
            : eq(messages.roomId, input.roomId),
        )
        .orderBy(desc(messages.createdAt), desc(messages.id))
        .limit(limit + 1);

      const hasMore = fetchedRows.length > limit;
      const rows = fetchedRows.slice(0, limit).reverse();

      const messageIds = rows.map((message) => message.id);

      const reactionRows =
        messageIds.length > 0
          ? await db
              .select({
                messageId: messageReactions.messageId,
                userId: messageReactions.userId,
                emoji: messageReactions.emoji,
              })
              .from(messageReactions)
              .where(inArray(messageReactions.messageId, messageIds))
          : [];

      const reactionMap = buildReactionMap(reactionRows, user.id);

      const replyToMessageIds = Array.from(
        new Set(
          rows
            .map((message) => message.replyToMessageId)
            .filter((messageId): messageId is string => Boolean(messageId)),
        ),
      );
      const missingReplyToMessageIds = replyToMessageIds.filter(
        (messageId) => !messageIds.includes(messageId),
      );
      const replyRows =
        missingReplyToMessageIds.length > 0
          ? await db
              .select({
                id: messages.id,
                content: messages.content,
                createdAt: messages.createdAt,
                authorUsername: profiles.username,
              })
              .from(messages)
              .innerJoin(profiles, eq(messages.userId, profiles.id))
              .where(
                and(
                  inArray(messages.id, missingReplyToMessageIds),
                  eq(messages.roomId, input.roomId),
                ),
              )
          : [];

      const messagePreviewById = new Map([
        ...rows.map(
          (message) =>
            [
              message.id,
              {
                id: message.id,
                content: message.content,
                authorUsername: message.authorUsername,
                createdAt: message.createdAt.toISOString(),
              },
            ] as const,
        ),
        ...replyRows.map(
          (message) =>
            [
              message.id,
              {
                id: message.id,
                content: message.content,
                authorUsername: message.authorUsername,
                createdAt: message.createdAt.toISOString(),
              },
            ] as const,
        ),
      ]);

      const nextCursor = hasMore
        ? rows[0]
          ? {
              id: rows[0].id,
              createdAt: rows[0].createdAt.toISOString(),
            }
          : null
        : null;

      const pageInfo: ChatMessagePageInfo = {
        hasMore,
        nextCursor,
      };

      const serializedMessages: ChatMessage[] = rows.map((message) => ({
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        replyToMessageId: message.replyToMessageId,
        content: message.content,
        isEdited: message.isEdited,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        author: {
          id: message.authorId,
          username: message.authorUsername,
          avatarUrl: getSafeAvatarUrl(message.authorAvatarUrl),
        },
        replyToMessage: message.replyToMessageId
          ? messagePreviewById.get(message.replyToMessageId) ?? null
          : null,
        reactions: getReactionsForMessage(reactionMap, message.id),
      }));

      return actionSuccess({
        messages: serializedMessages,
        pageInfo,
      });
    },
  );
}

export async function sendMessageAction(
  input: SendMessageInput,
): Promise<
  ActionResponse<{
    messageId: string;
    content: string;
    replyToMessageId: string | null;
    createdAt: string;
    updatedAt: string;
  }>
> {
  return withAuthedValidatedInput(
    sendMessageSchema,
    input,
    async ({ input, user }) => {
      const arcjetDecision = await protectSendMessageAction(user.id);

      if (!arcjetDecision.ok) {
        return arcjetDecision;
      }

      const canSendMessage = await isRoomMember(input.roomId, user.id);

      if (!canSendMessage) {
        return actionError(
          "FORBIDDEN",
          "Join this room before sending messages.",
        );
      }

      if (input.replyToMessageId) {
        const [replyMessage] = await db
          .select({
            id: messages.id,
          })
          .from(messages)
          .where(
            and(
              eq(messages.id, input.replyToMessageId),
              eq(messages.roomId, input.roomId),
            ),
          )
          .limit(1);

        if (!replyMessage) {
          return actionError(
            "BAD_REQUEST",
            "The message you are replying to was not found.",
          );
        }
      }

      try {
        const now = new Date();

        const [createdMessage] = await db
          .insert(messages)
          .values({
            roomId: input.roomId,
            userId: user.id,
            content: input.content,
            replyToMessageId: input.replyToMessageId ?? null,
            isEdited: false,
            createdAt: now,
            updatedAt: now,
          })
          .returning({
            id: messages.id,
            content: messages.content,
            replyToMessageId: messages.replyToMessageId,
            createdAt: messages.createdAt,
            updatedAt: messages.updatedAt,
          });

        return actionSuccess(
          {
            messageId: createdMessage.id,
            content: createdMessage.content,
            replyToMessageId: createdMessage.replyToMessageId,
            createdAt: createdMessage.createdAt.toISOString(),
            updatedAt: createdMessage.updatedAt.toISOString(),
          },
          "Message sent.",
        );
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to send message. Please try again.",
        );
      }
    },
  );
}

export async function updateMessageAction(
  input: UpdateMessageInput,
): Promise<
  ActionResponse<{
    messageId: string;
    content: string;
    isEdited: boolean;
    updatedAt: string;
  }>
> {
  return withAuthedValidatedInput(
    updateMessageSchema,
    input,
    async ({ input, user }) => {
      const message = await getOwnedMessageForMutation(
        input.messageId,
        user.id,
      );

      if (!message) {
        return actionError(
          "FORBIDDEN",
          "You can only edit your own messages in rooms you belong to.",
        );
      }

      try {
        const now = new Date();
        const [updatedMessage] = await db
          .update(messages)
          .set({
            content: input.content,
            isEdited: true,
            updatedAt: now,
          })
          .where(
            and(eq(messages.id, input.messageId), eq(messages.userId, user.id)),
          )
          .returning({
            id: messages.id,
            content: messages.content,
            isEdited: messages.isEdited,
            updatedAt: messages.updatedAt,
          });

        if (!updatedMessage) {
          return actionError(
            "NOT_FOUND",
            "This message could not be found.",
          );
        }

        revalidatePath("/chat");

        return actionSuccess(
          {
            messageId: updatedMessage.id,
            content: updatedMessage.content,
            isEdited: updatedMessage.isEdited,
            updatedAt: updatedMessage.updatedAt.toISOString(),
          },
          "Message edited.",
        );
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to edit message. Please try again.",
        );
      }
    },
  );
}

export async function deleteMessageAction(
  input: MessageIdInput,
): Promise<ActionResponse<{ messageId: string }>> {
  return withAuthedValidatedInput(
    messageIdSchema,
    input,
    async ({ input, user }) => {
      const message = await getOwnedMessageForMutation(
        input.messageId,
        user.id,
      );

      if (!message) {
        return actionError(
          "FORBIDDEN",
          "You can only delete your own messages in rooms you belong to.",
        );
      }

      try {
        const [deletedMessage] = await db
          .delete(messages)
          .where(
            and(eq(messages.id, input.messageId), eq(messages.userId, user.id)),
          )
          .returning({
            id: messages.id,
          });

        if (!deletedMessage) {
          return actionError(
            "NOT_FOUND",
            "This message could not be found.",
          );
        }

        revalidatePath("/chat");

        return actionSuccess(
          {
            messageId: deletedMessage.id,
          },
          "Message deleted.",
        );
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to delete message. Please try again.",
        );
      }
    },
  );
}
