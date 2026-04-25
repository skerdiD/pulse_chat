"use server";

import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { messageReactions, messages, profiles, roomMembers, rooms } from "@/db/schema";
import { createRoomAj } from "@/lib/arcjet";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import {
  createRoomSchema,
  joinRoomSchema,
  type CreateRoomInput,
  type JoinRoomInput,
} from "@/server/validators/chat";
import type { ChatRoom } from "@/types/chat";

function createRoomSlug(name: string) {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  const suffix = crypto.randomUUID().slice(0, 8);

  return `${baseSlug || "room"}-${suffix}`;
}

async function protectCreateRoomAction(userId: string) {
  try {
    const req = await request();
    const decision = await createRoomAj.protect(req, {
      requested: 1,
      userId,
    });

    if (decision.isDenied()) {
      return actionError(
        "RATE_LIMITED",
        "You are creating rooms too fast. Please wait a moment and try again.",
      );
    }

    return actionSuccess(undefined);
  } catch {
    return actionSuccess(undefined);
  }
}

export async function getRoomsForCurrentUser(): Promise<
  ActionResponse<{ rooms: ChatRoom[] }>
> {
  return withAuthedValidatedInput(
    joinRoomSchema.pick({}).optional().default({}),
    {},
    async ({ user }) => {
      const memberships = await db
        .select({
          roomId: roomMembers.roomId,
          role: roomMembers.role,
        })
        .from(roomMembers)
        .where(eq(roomMembers.userId, user.id));

      const membershipByRoomId = new Map(
        memberships.map((membership) => [
          membership.roomId,
          membership.role,
        ]),
      );

      const memberRoomIds = memberships.map((membership) => membership.roomId);

      const visibleRooms =
        memberRoomIds.length > 0
          ? await db
              .select()
              .from(rooms)
              .where(
                or(
                  eq(rooms.visibility, "public"),
                  inArray(rooms.id, memberRoomIds),
                ),
              )
              .orderBy(desc(rooms.updatedAt), desc(rooms.createdAt))
          : await db
              .select()
              .from(rooms)
              .where(eq(rooms.visibility, "public"))
              .orderBy(desc(rooms.updatedAt), desc(rooms.createdAt));

      const roomIds = visibleRooms.map((room) => room.id);

      if (roomIds.length === 0) {
        return actionSuccess({
          rooms: [],
        });
      }

      const memberCounts = await db
        .select({
          roomId: roomMembers.roomId,
          memberCount: count(roomMembers.id),
        })
        .from(roomMembers)
        .where(inArray(roomMembers.roomId, roomIds))
        .groupBy(roomMembers.roomId);

      const memberCountByRoomId = new Map(
        memberCounts.map((item) => [item.roomId, Number(item.memberCount)]),
      );

      const latestMessages = await db
        .select({
          id: messages.id,
          roomId: messages.roomId,
          content: messages.content,
          createdAt: messages.createdAt,
          authorUsername: profiles.username,
        })
        .from(messages)
        .leftJoin(profiles, eq(messages.userId, profiles.id))
        .where(inArray(messages.roomId, roomIds))
        .orderBy(desc(messages.createdAt));

      const latestMessageByRoomId = new Map<
        string,
        {
          id: string;
          content: string;
          createdAt: Date;
          authorUsername: string | null;
        }
      >();

      for (const message of latestMessages) {
        if (!latestMessageByRoomId.has(message.roomId)) {
          latestMessageByRoomId.set(message.roomId, {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            authorUsername: message.authorUsername,
          });
        }
      }

      const serializedRooms: ChatRoom[] = visibleRooms.map((room) => {
        const latestMessage = latestMessageByRoomId.get(room.id) ?? null;
        const currentUserRole = membershipByRoomId.get(room.id) ?? null;

        return {
          id: room.id,
          name: room.name,
          slug: room.slug,
          description: room.description,
          ownerId: room.ownerId,
          visibility: room.visibility,
          isArchived: room.isArchived,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
          memberCount: memberCountByRoomId.get(room.id) ?? 0,
          isMember: Boolean(currentUserRole),
          currentUserRole,
          latestMessagePreview: latestMessage
            ? {
                id: latestMessage.id,
                content: latestMessage.content,
                createdAt: latestMessage.createdAt.toISOString(),
                authorUsername: latestMessage.authorUsername ?? "Unknown user",
              }
            : null,
        };
      });

      return actionSuccess({
        rooms: serializedRooms,
      });
    },
  );
}

export async function createRoomAction(input: CreateRoomInput): Promise<
  ActionResponse<{
    roomId: string;
  }>
> {
  return withAuthedValidatedInput(createRoomSchema, input, async ({ input, user }) => {
    const arcjetDecision = await protectCreateRoomAction(user.id);

    if (!arcjetDecision.ok) {
      return arcjetDecision;
    }

    const slug = createRoomSlug(input.name);
    const now = new Date();

    try {
      const createdRoom = await db.transaction(async (tx) => {
        const [room] = await tx
          .insert(rooms)
          .values({
            name: input.name,
            slug,
            description: input.description ?? null,
            visibility: input.visibility,
            ownerId: user.id,
            isArchived: false,
            createdAt: now,
            updatedAt: now,
          })
          .returning({
            id: rooms.id,
          });

        await tx
          .insert(roomMembers)
          .values({
            roomId: room.id,
            userId: user.id,
            role: "owner",
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();

        return room;
      });

      revalidatePath("/chat");

      return actionSuccess(
        {
          roomId: createdRoom.id,
        },
        "Room created successfully.",
      );
    } catch {
      return actionError(
        "INTERNAL_ERROR",
        "Unable to create room. Please try again.",
      );
    }
  });
}

export async function joinRoomAction(input: JoinRoomInput): Promise<
  ActionResponse<{
    roomId: string;
  }>
> {
  return withAuthedValidatedInput(joinRoomSchema, input, async ({ input, user }) => {
    const [room] = await db
      .select({
        id: rooms.id,
        visibility: rooms.visibility,
      })
      .from(rooms)
      .where(and(eq(rooms.id, input.roomId), eq(rooms.isArchived, false)))
      .limit(1);

    if (!room) {
      return actionError("NOT_FOUND", "Room was not found.");
    }

    if (room.visibility !== "public") {
      return actionError(
        "FORBIDDEN",
        "This room is private. Invite access can be added later.",
      );
    }

    try {
      const now = new Date();

      await db
        .insert(roomMembers)
        .values({
          roomId: room.id,
          userId: user.id,
          role: "member",
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();

      revalidatePath("/chat");

      return actionSuccess(
        {
          roomId: room.id,
        },
        "Joined room successfully.",
      );
    } catch {
      return actionError(
        "INTERNAL_ERROR",
        "Unable to join room. Please try again.",
      );
    }
  });
}

export async function getRoomReactionCount(roomId: string) {
  const rows = await db
    .select({
      count: count(messageReactions.id),
    })
    .from(messageReactions)
    .innerJoin(messages, eq(messageReactions.messageId, messages.id))
    .where(eq(messages.roomId, roomId));

  return Number(rows[0]?.count ?? 0);
}