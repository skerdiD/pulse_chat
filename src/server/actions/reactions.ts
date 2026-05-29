"use server";

import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { messageReactions, messages, roomMembers, rooms } from "@/db/schema";
import { toggleReactionAj } from "@/lib/arcjet";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import { protectWithArcjet } from "@/server/actions/arcjet-protection";
import {
  toggleReactionSchema,
  type ToggleReactionInput,
} from "@/server/validators/chat";

async function protectReactionAction(userId: string) {
  return protectWithArcjet({
    actionName: "toggle_reaction",
    deniedMessage:
      "You are reacting too fast. Please wait a moment and try again.",
    failureMode: "fail-open",
    getDecision: async () => {
      const req = await request();
      return toggleReactionAj.protect(req, {
        userId,
      });
    },
    userId,
  });
}

async function getMessageIfUserCanReact(messageId: string, userId: string) {
  const [message] = await db
    .select({
      id: messages.id,
      roomId: messages.roomId,
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
    .where(and(eq(messages.id, messageId), eq(rooms.isArchived, false)))
    .limit(1);

  return message ?? null;
}

export async function toggleReactionAction(
  input: ToggleReactionInput,
): Promise<
  ActionResponse<{
    messageId: string;
    emoji: string;
    action: "added" | "removed";
  }>
> {
  return withAuthedValidatedInput<
    typeof toggleReactionSchema,
    {
      messageId: string;
      emoji: string;
      action: "added" | "removed";
    }
  >(
    toggleReactionSchema,
    input,
    async ({ input, user }) => {
      const arcjetDecision = await protectReactionAction(user.id);

      if (!arcjetDecision.ok) {
        return arcjetDecision;
      }

      const message = await getMessageIfUserCanReact(input.messageId, user.id);

      if (!message) {
        return actionError(
          "FORBIDDEN",
          "You must be a room member to react to this message.",
        );
      }

      const [existingReaction] = await db
        .select({
          id: messageReactions.id,
        })
        .from(messageReactions)
        .where(
          and(
            eq(messageReactions.messageId, input.messageId),
            eq(messageReactions.userId, user.id),
            eq(messageReactions.emoji, input.emoji),
          ),
        )
        .limit(1);

      try {
        if (existingReaction) {
          await db
            .delete(messageReactions)
            .where(eq(messageReactions.id, existingReaction.id));

          revalidatePath("/chat");

          return actionSuccess(
            {
              messageId: input.messageId,
              emoji: input.emoji,
              action: "removed",
            },
            "Reaction removed.",
          );
        }

        await db
          .insert(messageReactions)
          .values({
            messageId: input.messageId,
            userId: user.id,
            emoji: input.emoji,
            createdAt: new Date(),
          })
          .onConflictDoNothing();

        revalidatePath("/chat");

        return actionSuccess(
          {
            messageId: input.messageId,
            emoji: input.emoji,
            action: "added",
          },
          "Reaction added.",
        );
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to update reaction. Please try again.",
        );
      }
    },
  );
}
