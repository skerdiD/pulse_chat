"use server";

import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { messages, profiles, roomMembers } from "@/db/schema";
import { sendMessageAj } from "@/lib/arcjet";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import {
  roomIdSchema,
  sendMessageSchema,
  type SendMessageInput,
} from "@/server/validators/chat";
import type { ChatMessage } from "@/types/chat";

async function protectSendMessageAction(userId: string) {
  try {
    const req = await request();
    const decision = await sendMessageAj.protect(req, {
      requested: 1,
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
          avatarUrl: message.authorAvatarUrl,
        },
        replyToMessage: message.replyToMessageId
          ? messagePreviewById.get(message.replyToMessageId) ?? null
          : null,
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
          });

        revalidatePath("/chat");

        return actionSuccess(
          {
            messageId: createdMessage.id,
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