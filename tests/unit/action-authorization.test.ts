import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  delete: vi.fn(),
  insert: vi.fn(),
  protectWithArcjet: vi.fn(),
  revalidatePath: vi.fn(),
  requireUser: vi.fn(),
  select: vi.fn(),
  selectDistinctOn: vi.fn(),
  update: vi.fn(),
}));

const selectResults: unknown[][] = [];
const insertResults: unknown[][] = [];
const updateResults: unknown[][] = [];
const deleteResults: unknown[][] = [];
const whereArgs: unknown[] = [];

function takeNextResult(queue: unknown[][]) {
  return Promise.resolve(queue.shift() ?? []);
}

function createSelectChain() {
  const chain = {
    from: vi.fn(() => chain),
    groupBy: vi.fn(() => takeNextResult(selectResults)),
    innerJoin: vi.fn(() => chain),
    leftJoin: vi.fn(() => chain),
    limit: vi.fn(() => takeNextResult(selectResults)),
    orderBy: vi.fn(() => takeNextResult(selectResults)),
    then: (
      onFulfilled?: (value: unknown[]) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => takeNextResult(selectResults).then(onFulfilled, onRejected),
    where: vi.fn((predicate: unknown) => {
      whereArgs.push(predicate);
      return chain;
    }),
  };

  return chain;
}

function createInsertChain() {
  const chain = {
    onConflictDoNothing: vi.fn(() => Promise.resolve()),
    returning: vi.fn(() => takeNextResult(insertResults)),
    values: vi.fn(() => chain),
  };

  return chain;
}

function createUpdateChain() {
  const chain = {
    returning: vi.fn(() => takeNextResult(updateResults)),
    set: vi.fn(() => chain),
    where: vi.fn((predicate: unknown) => {
      whereArgs.push(predicate);
      return chain;
    }),
  };

  return chain;
}

function createDeleteChain() {
  const chain = {
    returning: vi.fn(() => takeNextResult(deleteResults)),
    where: vi.fn((predicate: unknown) => {
      whereArgs.push(predicate);
      return chain;
    }),
  };

  return chain;
}

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/server/auth", () => ({
  requireUser: mocks.requireUser,
}));

vi.mock("@/server/actions/arcjet-protection", () => ({
  protectWithArcjet: mocks.protectWithArcjet,
}));

vi.mock("@/lib/arcjet", () => ({
  createRoomAj: {},
  joinRoomAj: {},
  roomUpdateAj: {},
  sendMessageAj: {},
}));

vi.mock("@/db", () => ({
  db: {
    delete: mocks.delete,
    insert: mocks.insert,
    select: mocks.select,
    selectDistinctOn: mocks.selectDistinctOn,
    update: mocks.update,
  },
}));

import {
  deleteMessageAction,
  getMessagesForRoom,
  sendMessageAction,
  updateMessageAction,
} from "@/server/actions/messages";
import {
  addRoomMemberAction,
  getRoomsForCurrentUser,
  joinRoomAction,
  leaveRoomAction,
  markRoomAsReadAction,
  removeRoomMemberAction,
  updateRoomAction,
} from "@/server/actions/rooms";

const currentUserId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const privateRoomId = "33333333-3333-4333-8333-333333333333";
const publicRoomId = "44444444-4444-4444-8444-444444444444";
const messageId = "55555555-5555-4555-8555-555555555555";
const membershipId = "66666666-6666-4666-8666-666666666666";

function createUser(id = currentUserId): User {
  return {
    id,
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
    user_metadata: {},
  };
}

function createRoomRow(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    ownerId: string;
    visibility: "public" | "private";
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) {
  return {
    id: overrides.id ?? publicRoomId,
    name: overrides.name ?? "Room",
    slug: overrides.slug ?? "room",
    description: overrides.description ?? null,
    ownerId: overrides.ownerId ?? otherUserId,
    visibility: overrides.visibility ?? "public",
    isArchived: overrides.isArchived ?? false,
    createdAt: overrides.createdAt ?? new Date("2026-05-29T12:00:00.000Z"),
    updatedAt: overrides.updatedAt ?? new Date("2026-05-29T12:00:00.000Z"),
  };
}

function createMembershipContext(
  overrides: Partial<{
    id: string;
    roomId: string;
    userId: string;
    role: "owner" | "admin" | "member";
    roomOwnerId: string;
  }> = {},
) {
  return {
    id: overrides.id ?? membershipId,
    roomId: overrides.roomId ?? privateRoomId,
    userId: overrides.userId ?? currentUserId,
    role: overrides.role ?? "owner",
    roomOwnerId: overrides.roomOwnerId ?? currentUserId,
  };
}

function createMemberRow(
  overrides: Partial<{
    id: string;
    userId: string;
    role: "owner" | "admin" | "member";
  }> = {},
) {
  return {
    id: overrides.id ?? membershipId,
    userId: overrides.userId ?? otherUserId,
    role: overrides.role ?? "member",
  };
}

function queueSelectResult(result: unknown[]) {
  selectResults.push(result);
}

function resetDbMocks() {
  selectResults.length = 0;
  insertResults.length = 0;
  updateResults.length = 0;
  deleteResults.length = 0;
  whereArgs.length = 0;

  mocks.delete.mockImplementation(createDeleteChain);
  mocks.insert.mockImplementation(createInsertChain);
  mocks.select.mockImplementation(createSelectChain);
  mocks.selectDistinctOn.mockImplementation(createSelectChain);
  mocks.update.mockImplementation(createUpdateChain);
}

function hasDeepValue(value: unknown, expected: unknown) {
  const seen = new WeakSet<object>();

  function visit(item: unknown): boolean {
    if (item === expected) {
      return true;
    }

    if (!item || typeof item !== "object") {
      return false;
    }

    if (seen.has(item)) {
      return false;
    }

    seen.add(item);

    for (const symbol of Object.getOwnPropertySymbols(item)) {
      if (visit(Reflect.get(item, symbol))) {
        return true;
      }
    }

    return Object.values(item).some(visit);
  }

  return visit(value);
}

function expectForbidden(result: Awaited<ReturnType<typeof sendMessageAction>>) {
  expect(result.ok).toBe(false);

  if (!result.ok) {
    expect(result.error.code).toBe("FORBIDDEN");
  }
}

describe("chat action authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
    mocks.requireUser.mockResolvedValue(createUser());
    mocks.protectWithArcjet.mockResolvedValue({
      ok: true,
      data: undefined,
    });
  });

  it("prevents non-members from reading messages in a private room", async () => {
    queueSelectResult([]);

    const result = await getMessagesForRoom(privateRoomId);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
      expect(result.error.message).toBe("Join this room before viewing messages.");
    }

    expect(mocks.select).toHaveBeenCalledTimes(1);
    expect(whereArgs.some((arg) => hasDeepValue(arg, "is_archived"))).toBe(
      true,
    );
    expect(whereArgs.some((arg) => hasDeepValue(arg, false))).toBe(true);
  });

  it("prevents non-members from sending messages to a private room", async () => {
    queueSelectResult([]);

    const result = await sendMessageAction({
      roomId: privateRoomId,
      content: "Hello",
    });

    expectForbidden(result);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("blocks new messages in archived rooms", async () => {
    queueSelectResult([]);

    const result = await sendMessageAction({
      roomId: privateRoomId,
      content: "Archived rooms should stay quiet",
    });

    expectForbidden(result);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(whereArgs.some((arg) => hasDeepValue(arg, "is_archived"))).toBe(
      true,
    );
    expect(whereArgs.some((arg) => hasDeepValue(arg, false))).toBe(true);
  });

  it("prevents users from editing another user's message", async () => {
    queueSelectResult([]);

    const result = await updateMessageAction({
      messageId,
      content: "Edited by someone else",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
    }

    expect(mocks.update).not.toHaveBeenCalled();
    expect(whereArgs.some((arg) => hasDeepValue(arg, "user_id"))).toBe(true);
    expect(whereArgs.some((arg) => hasDeepValue(arg, currentUserId))).toBe(true);
  });

  it("prevents users from deleting another user's message", async () => {
    queueSelectResult([]);

    const result = await deleteMessageAction({ messageId });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
    }

    expect(mocks.delete).not.toHaveBeenCalled();
    expect(whereArgs.some((arg) => hasDeepValue(arg, "user_id"))).toBe(true);
    expect(whereArgs.some((arg) => hasDeepValue(arg, currentUserId))).toBe(true);
  });

  it("prevents non-owner users from updating room settings", async () => {
    queueSelectResult([
      createRoomRow({
        id: privateRoomId,
        ownerId: otherUserId,
        visibility: "private",
      }),
    ]);

    const result = await updateRoomAction({
      roomId: privateRoomId,
      description: undefined,
      name: undefined,
      visibility: "public",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
      expect(result.error.message).toBe("Only the room owner can edit this room.");
    }

    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("allows joining public rooms and blocks joining private rooms", async () => {
    queueSelectResult([
      createRoomRow({ id: privateRoomId, visibility: "private" }),
    ]);

    const privateResult = await joinRoomAction({ roomId: privateRoomId });

    expect(privateResult.ok).toBe(false);

    if (!privateResult.ok) {
      expect(privateResult.error.code).toBe("FORBIDDEN");
    }

    expect(mocks.insert).not.toHaveBeenCalled();

    queueSelectResult([createRoomRow({ id: publicRoomId, visibility: "public" })]);

    const publicResult = await joinRoomAction({ roomId: publicRoomId });

    expect(publicResult.ok).toBe(true);
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/chat");
  });

  it("returns public rooms plus private rooms the user belongs to", async () => {
    const privateRoom = createRoomRow({
      id: privateRoomId,
      name: "Private Team",
      visibility: "private",
    });
    const publicRoom = createRoomRow({
      id: publicRoomId,
      name: "Public Lobby",
      visibility: "public",
    });

    queueSelectResult([{ roomId: privateRoomId, role: "member" }]);
    queueSelectResult([publicRoom, privateRoom]);
    queueSelectResult([
      { roomId: publicRoomId, memberCount: 3 },
      { roomId: privateRoomId, memberCount: 2 },
    ]);
    queueSelectResult([]);
    queueSelectResult([{ roomId: privateRoomId, unreadCount: 4 }]);

    const result = await getRoomsForCurrentUser();

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.rooms).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: publicRoomId,
            isMember: false,
            visibility: "public",
          }),
          expect.objectContaining({
            id: privateRoomId,
            currentUserRole: "member",
            isMember: true,
            unreadCount: 4,
            visibility: "private",
          }),
        ]),
      );
      expect(result.data.rooms).toHaveLength(2);
    }

    expect(whereArgs.some((arg) => hasDeepValue(arg, "is_archived"))).toBe(
      true,
    );
    expect(whereArgs.some((arg) => hasDeepValue(arg, "public"))).toBe(true);
  });

  it("marks a joined room as read for the current user", async () => {
    const membershipId = "66666666-6666-4666-8666-666666666666";
    const lastReadAt = new Date("2026-05-29T12:15:00.000Z");

    queueSelectResult([{ id: membershipId }]);
    updateResults.push([{ roomId: privateRoomId, lastReadAt }]);

    const result = await markRoomAsReadAction(privateRoomId);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data).toEqual({
        roomId: privateRoomId,
        lastReadAt: lastReadAt.toISOString(),
      });
    }

    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(whereArgs.some((arg) => hasDeepValue(arg, membershipId))).toBe(true);
  });

  it("prevents non-members from marking a private room as read", async () => {
    queueSelectResult([]);

    const result = await markRoomAsReadAction(privateRoomId);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
    }

    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("allows owners and admins to add a member to a private room", async () => {
    queueSelectResult([createMembershipContext({ role: "admin" })]);
    queueSelectResult([
      {
        id: otherUserId,
        username: "Teammate",
        avatarUrl: null,
      },
    ]);
    queueSelectResult([]);
    insertResults.push([
      {
        id: membershipId,
        userId: otherUserId,
        role: "member",
        joinedAt: new Date("2026-05-29T12:30:00.000Z"),
      },
    ]);

    const result = await addRoomMemberAction({
      roomId: privateRoomId,
      userId: otherUserId,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.member).toEqual(
        expect.objectContaining({
          userId: otherUserId,
          role: "member",
          username: "Teammate",
        }),
      );
    }

    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/chat");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/chat/rooms/${privateRoomId}/settings`,
    );
  });

  it("prevents normal members from adding another member", async () => {
    queueSelectResult([createMembershipContext({ role: "member" })]);

    const result = await addRoomMemberAction({
      roomId: privateRoomId,
      userId: otherUserId,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
    }

    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("prevents non-members from adding themselves to a private room", async () => {
    queueSelectResult([]);

    const result = await addRoomMemberAction({
      roomId: privateRoomId,
      userId: currentUserId,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
    }

    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("handles duplicate room membership safely", async () => {
    queueSelectResult([createMembershipContext({ role: "owner" })]);
    queueSelectResult([
      {
        id: otherUserId,
        username: "Teammate",
        avatarUrl: null,
      },
    ]);
    queueSelectResult([createMemberRow({ userId: otherUserId })]);

    const result = await addRoomMemberAction({
      roomId: privateRoomId,
      userId: otherUserId,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("CONFLICT");
    }

    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("blocks member changes in archived rooms", async () => {
    queueSelectResult([]);

    const result = await addRoomMemberAction({
      roomId: privateRoomId,
      userId: otherUserId,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
    }

    expect(whereArgs.some((arg) => hasDeepValue(arg, "is_archived"))).toBe(
      true,
    );
    expect(whereArgs.some((arg) => hasDeepValue(arg, false))).toBe(true);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("allows owners and admins to remove a member", async () => {
    queueSelectResult([createMembershipContext({ role: "owner" })]);
    queueSelectResult([createMemberRow({ userId: otherUserId })]);
    deleteResults.push([{ roomId: privateRoomId, userId: otherUserId }]);

    const result = await removeRoomMemberAction({
      roomId: privateRoomId,
      userId: otherUserId,
    });

    expect(result.ok).toBe(true);
    expect(mocks.delete).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/chat");
  });

  it("prevents normal members from removing another member", async () => {
    queueSelectResult([createMembershipContext({ role: "member" })]);
    queueSelectResult([createMemberRow({ userId: otherUserId })]);

    const result = await removeRoomMemberAction({
      roomId: privateRoomId,
      userId: otherUserId,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("FORBIDDEN");
    }

    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("allows a member to leave a room", async () => {
    queueSelectResult([createMembershipContext({ role: "member" })]);
    queueSelectResult([
      createMemberRow({ userId: currentUserId, role: "member" }),
    ]);
    deleteResults.push([{ roomId: privateRoomId, userId: currentUserId }]);

    const result = await leaveRoomAction(privateRoomId);

    expect(result.ok).toBe(true);
    expect(mocks.delete).toHaveBeenCalledTimes(1);
    expect(whereArgs.some((arg) => hasDeepValue(arg, currentUserId))).toBe(
      true,
    );
  });

  it("prevents removing the last owner", async () => {
    queueSelectResult([createMembershipContext({ role: "owner" })]);
    queueSelectResult([
      createMemberRow({ userId: currentUserId, role: "owner" }),
    ]);
    queueSelectResult([{ ownerCount: 1 }]);

    const result = await leaveRoomAction(privateRoomId);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("CONFLICT");
    }

    expect(mocks.delete).not.toHaveBeenCalled();
  });
});
