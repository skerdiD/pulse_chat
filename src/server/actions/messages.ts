"use server";

import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  messageReactions,
  messages,
  profiles,
  roomMembers,
} from "@/db/schema";
import { sendMessageAj } from "@/lib/arcjet";
import { getSafeAvatarUrl } from "@/lib/avatar";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import {
  messageIdSchema,
  roomIdSchema,
  sendMessageSchema,
  updateMessageSchema,
  type MessageIdInput,
  type SendMessageInput,
  type UpdateMessageInput,
} from "@/server/validators/chat";
import type { ChatMessage, ChatMessageReactionSummary } from "@/types/chat";

async function protectSendMessageAction(userId: string) {
  try {
    const req = await request();
    const decision = await sendMessageAj.protect(req, {
      userId,
    });

    if (decision.isDenied()) {
      return actionError(
        "RATE_LIMITED",
        "You are sending messages too fast. Please slow down for a moment.",
      );
    }

    return actionSuccess(undefined);
  } catch {
    return actionSuccess(undefined);
  }
}

async function isRoomMember(roomId: string, userId: string) {
  const [membership] = await db
    .select({
      id: roomMembers.id,
    })
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)))
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
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
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
  roomId: string,
): Promise<ActionResponse<{ messages: ChatMessage[] }>> {
  return withAuthedValidatedInput(
    roomIdSchema,
    { roomId },
    async ({ input, user }) => {
      const canAccessRoom = await isRoomMember(input.roomId, user.id);

      if (!canAccessRoom) {
        return actionError(
          "FORBIDDEN",
          "Join this room before viewing messages.",
        );
      }

      const rows = await db
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
        .where(eq(messages.roomId, input.roomId))
        .orderBy(asc(messages.createdAt));

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

      const messagePreviewById = new Map(
        rows.map((message) => [
          message.id,
          {
            id: message.id,
            content: message.content,
            authorUsername: message.authorUsername,
            createdAt: message.createdAt.toISOString(),
          },
        ]),
      );

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
