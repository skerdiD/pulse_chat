"use server";

import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { messages, profiles, roomMembers, rooms } from "@/db/schema";
import { createRoomAj, joinRoomAj } from "@/lib/arcjet";
import { getSafeAvatarUrl } from "@/lib/avatar";
import { formatRoomPreviewTime } from "@/lib/format";
import {
  actionError,
  actionSuccess,
  requireActionUser,
  type ActionResponse,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import {
  createRoomSchema,
  joinRoomSchema,
  roomIdSchema,
  type CreateRoomInput,
  type JoinRoomInput,
} from "@/server/validators/chat";
import type { ChatRoom, ChatRoomMember } from "@/types/chat";

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

async function protectJoinRoomAction(userId: string) {
  try {
    const req = await request();
    const decision = await joinRoomAj.protect(req, {
      userId,
    });

    if (decision.isDenied()) {
      return actionError(
        "RATE_LIMITED",
        "You are joining rooms too fast. Please wait a moment and try again.",
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
  const auth = await requireActionUser();

  if (!auth.ok) {
    return actionError(auth.error.code, auth.error.message);
  }

  const user = auth.data;

  const memberships = await db
    .select({
      roomId: roomMembers.roomId,
      role: roomMembers.role,
    })
    .from(roomMembers)
    .where(eq(roomMembers.userId, user.id));

  const membershipByRoomId = new Map(
    memberships.map((membership) => [membership.roomId, membership.role]),
  );

  const memberRoomIds = memberships.map((membership) => membership.roomId);

  const visibleRooms =
    memberRoomIds.length > 0
      ? await db
          .select()
          .from(rooms)
          .where(
            and(
              eq(rooms.isArchived, false),
              or(
                eq(rooms.visibility, "public"),
                inArray(rooms.id, memberRoomIds),
              ),
            ),
          )
          .orderBy(desc(rooms.updatedAt), desc(rooms.createdAt))
      : await db
          .select()
          .from(rooms)
          .where(
            and(eq(rooms.visibility, "public"), eq(rooms.isArchived, false)),
          )
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

  const visibleMemberRoomIds = visibleRooms
    .filter((room) => membershipByRoomId.has(room.id))
    .map((room) => room.id);

  const latestMessages =
    visibleMemberRoomIds.length > 0
      ? await db
          .selectDistinctOn([messages.roomId], {
            id: messages.id,
            roomId: messages.roomId,
            content: messages.content,
            createdAt: messages.createdAt,
            authorUsername: profiles.username,
          })
          .from(messages)
          .leftJoin(profiles, eq(messages.userId, profiles.id))
          .where(inArray(messages.roomId, visibleMemberRoomIds))
          .orderBy(messages.roomId, desc(messages.createdAt))
      : [];

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

  const renderedAt = new Date();

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
            timeLabel: formatRoomPreviewTime(
              latestMessage.createdAt.toISOString(),
              renderedAt,
            ),
            authorUsername: latestMessage.authorUsername ?? "Unknown user",
          }
        : null,
    };
  });

  return actionSuccess({
    rooms: serializedRooms,
  });
}

export async function getRoomMembersForCurrentUserRoom(
  roomId: string,
): Promise<ActionResponse<{ members: ChatRoomMember[] }>> {
  return withAuthedValidatedInput(
    roomIdSchema,
    { roomId },
    async ({ input, user }) => {
      const [membership] = await db
        .select({
          id: roomMembers.id,
        })
        .from(roomMembers)
        .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
        .where(
          and(
            eq(roomMembers.roomId, input.roomId),
            eq(roomMembers.userId, user.id),
            eq(rooms.isArchived, false),
          ),
        )
        .limit(1);

      if (!membership) {
        return actionError(
          "FORBIDDEN",
          "You must be a room member to view members.",
        );
      }

      const rows = await db
        .select({
          id: roomMembers.id,
          userId: roomMembers.userId,
          role: roomMembers.role,
          joinedAt: roomMembers.createdAt,
          username: profiles.username,
          avatarUrl: profiles.avatarUrl,
        })
        .from(roomMembers)
        .innerJoin(profiles, eq(roomMembers.userId, profiles.id))
        .where(eq(roomMembers.roomId, input.roomId));

      const members: ChatRoomMember[] = rows.map((member) => ({
        id: member.id,
        userId: member.userId,
        username: member.username,
        avatarUrl: getSafeAvatarUrl(member.avatarUrl),
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      }));

      return actionSuccess({
        members,
      });
    },
  );
}

export async function createRoomAction(
  input: CreateRoomInput,
): Promise<
  ActionResponse<{
    roomId: string;
  }>
> {
  return withAuthedValidatedInput(
    createRoomSchema,
    input,
    async ({ input, user }) => {
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
    },
  );
}

export async function joinRoomAction(
  input: JoinRoomInput,
): Promise<
  ActionResponse<{
    roomId: string;
  }>
> {
  return withAuthedValidatedInput(
    joinRoomSchema,
    input,
    async ({ input, user }) => {
      const arcjetDecision = await protectJoinRoomAction(user.id);

      if (!arcjetDecision.ok) {
        return arcjetDecision;
      }

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
    },
  );
}
