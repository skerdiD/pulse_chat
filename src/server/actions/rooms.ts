"use server";

import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import { and, count, desc, eq, gt, inArray, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { messages, profiles, roomMembers, rooms } from "@/db/schema";
import { createRoomAj, joinRoomAj, roomUpdateAj } from "@/lib/arcjet";
import { getSafeAvatarUrl } from "@/lib/avatar";
import { formatRoomPreviewTime } from "@/lib/format";
import {
  actionError,
  actionSuccess,
  requireActionUser,
  type ActionResponse,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import { protectWithArcjet } from "@/server/actions/arcjet-protection";
import {
  createRoomSchema,
  deleteRoomSchema,
  joinRoomSchema,
  roomIdSchema,
  updateRoomSchema,
  type CreateRoomInput,
  type DeleteRoomInput,
  type JoinRoomInput,
  type UpdateRoomInput,
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
  return protectWithArcjet({
    actionName: "create_room",
    deniedMessage:
      "You are creating rooms too fast. Please wait a moment and try again.",
    failureMode: "fail-closed",
    getDecision: async () => {
      const req = await request();
      return createRoomAj.protect(req, {
        userId,
      });
    },
    unavailableMessage:
      "Room creation is temporarily unavailable. Please try again in a moment.",
    userId,
  });
}

async function protectJoinRoomAction(userId: string) {
  return protectWithArcjet({
    actionName: "join_room",
    deniedMessage:
      "You are joining rooms too fast. Please wait a moment and try again.",
    failureMode: "fail-open",
    getDecision: async () => {
      const req = await request();
      return joinRoomAj.protect(req, {
        userId,
      });
    },
    userId,
  });
}

async function protectRoomUpdateAction(userId: string) {
  return protectWithArcjet({
    actionName: "update_room",
    deniedMessage:
      "You are updating room settings too fast. Please wait a moment and try again.",
    failureMode: "fail-closed",
    getDecision: async () => {
      const req = await request();
      return roomUpdateAj.protect(req, {
        userId,
      });
    },
    unavailableMessage:
      "Room updates are temporarily unavailable. Please try again in a moment.",
    userId,
  });
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

  const unreadCounts =
    visibleMemberRoomIds.length > 0
      ? await db
          .select({
            roomId: messages.roomId,
            unreadCount: count(messages.id),
          })
          .from(messages)
          .innerJoin(
            roomMembers,
            and(
              eq(roomMembers.roomId, messages.roomId),
              eq(roomMembers.userId, user.id),
            ),
          )
          .where(
            and(
              inArray(messages.roomId, visibleMemberRoomIds),
              ne(messages.userId, user.id),
              gt(
                messages.createdAt,
                sql`coalesce(${roomMembers.lastReadAt}, ${roomMembers.createdAt})`,
              ),
            ),
          )
          .groupBy(messages.roomId)
      : [];

  const unreadCountByRoomId = new Map(
    unreadCounts.map((item) => [item.roomId, Number(item.unreadCount)]),
  );

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
      unreadCount: currentUserRole ? (unreadCountByRoomId.get(room.id) ?? 0) : 0,
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

export async function markRoomAsReadAction(
  input: string | { roomId: string },
): Promise<ActionResponse<{ roomId: string; lastReadAt: string }>> {
  const actionInput = typeof input === "string" ? { roomId: input } : input;

  return withAuthedValidatedInput(
    roomIdSchema,
    actionInput,
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
          "Join this room before marking messages as read.",
        );
      }

      const now = new Date();

      try {
        const [updatedMembership] = await db
          .update(roomMembers)
          .set({
            lastReadAt: now,
            updatedAt: now,
          })
          .where(eq(roomMembers.id, membership.id))
          .returning({
            roomId: roomMembers.roomId,
            lastReadAt: roomMembers.lastReadAt,
          });

        if (!updatedMembership?.lastReadAt) {
          return actionError(
            "NOT_FOUND",
            "Room membership could not be updated.",
          );
        }

        return actionSuccess({
          roomId: updatedMembership.roomId,
          lastReadAt: updatedMembership.lastReadAt.toISOString(),
        });
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to mark this room as read. Please try again.",
        );
      }
    },
  );
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
              lastReadAt: now,
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
            lastReadAt: now,
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

export async function updateRoomAction(
  input: UpdateRoomInput,
): Promise<ActionResponse<{ roomId: string }>> {
  return withAuthedValidatedInput(
    updateRoomSchema,
    input,
    async ({ input, user }) => {
      const arcjetDecision = await protectRoomUpdateAction(user.id);

      if (!arcjetDecision.ok) {
        return arcjetDecision;
      }

      const [room] = await db
        .select({
          id: rooms.id,
          ownerId: rooms.ownerId,
          isArchived: rooms.isArchived,
          name: rooms.name,
          description: rooms.description,
          visibility: rooms.visibility,
        })
        .from(rooms)
        .where(eq(rooms.id, input.roomId))
        .limit(1);

      if (!room || room.isArchived) {
        return actionError("NOT_FOUND", "Room was not found.");
      }

      if (room.ownerId !== user.id) {
        return actionError(
          "FORBIDDEN",
          "Only the room owner can edit this room.",
        );
      }

      const nextName = input.name ?? room.name;
      const nextDescription = input.description ?? null;
      const nextVisibility = input.visibility ?? room.visibility;
      const now = new Date();

      try {
        const [updatedRoom] = await db
          .update(rooms)
          .set({
            name: nextName,
            description: nextDescription,
            visibility: nextVisibility,
            updatedAt: now,
          })
          .where(and(eq(rooms.id, input.roomId), eq(rooms.ownerId, user.id)))
          .returning({
            id: rooms.id,
          });

        if (!updatedRoom) {
          return actionError(
            "NOT_FOUND",
            "Room was not found or could not be updated.",
          );
        }

        revalidatePath("/chat");
        revalidatePath(`/chat/rooms/${updatedRoom.id}/settings`);

        return actionSuccess(
          {
            roomId: updatedRoom.id,
          },
          "Room updated successfully.",
        );
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to update room. Please try again.",
        );
      }
    },
  );
}

export async function deleteRoomAction(
  input: DeleteRoomInput,
): Promise<ActionResponse<{ roomId: string }>> {
  return withAuthedValidatedInput(
    deleteRoomSchema,
    input,
    async ({ input, user }) => {
      const [room] = await db
        .select({
          id: rooms.id,
          ownerId: rooms.ownerId,
          isArchived: rooms.isArchived,
        })
        .from(rooms)
        .where(eq(rooms.id, input.roomId))
        .limit(1);

      if (!room || room.isArchived) {
        return actionError("NOT_FOUND", "Room was not found.");
      }

      if (room.ownerId !== user.id) {
        return actionError(
          "FORBIDDEN",
          "Only the room owner can delete this room.",
        );
      }

      try {
        const now = new Date();
        const [deletedRoom] = await db
          .update(rooms)
          .set({
            isArchived: true,
            updatedAt: now,
          })
          .where(and(eq(rooms.id, input.roomId), eq(rooms.ownerId, user.id)))
          .returning({
            id: rooms.id,
          });

        if (!deletedRoom) {
          return actionError(
            "NOT_FOUND",
            "Room was not found or was already deleted.",
          );
        }

        revalidatePath("/chat");

        return actionSuccess(
          {
            roomId: deletedRoom.id,
          },
          "Room deleted successfully.",
        );
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to delete room. Please try again.",
        );
      }
    },
  );
}
