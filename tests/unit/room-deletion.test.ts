import { describe, expect, it } from "vitest";

import {
  canDeleteRoom,
  getNextRoomIdAfterDeletion,
  removeRoomFromList,
} from "@/components/chat/room-deletion";
import type { ChatRoom } from "@/types/chat";

function createRoom(overrides: Partial<ChatRoom> = {}): ChatRoom {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: overrides.name ?? "Room",
    slug: overrides.slug ?? "room",
    description: overrides.description ?? null,
    ownerId: overrides.ownerId ?? "11111111-1111-4111-8111-111111111111",
    visibility: overrides.visibility ?? "public",
    isArchived: overrides.isArchived ?? false,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    memberCount: overrides.memberCount ?? 1,
    isMember: overrides.isMember ?? true,
    currentUserRole: overrides.currentUserRole ?? "member",
    latestMessagePreview: overrides.latestMessagePreview ?? null,
  };
}

describe("room deletion helpers", () => {
  it("allows owners to delete rooms", () => {
    expect(canDeleteRoom(createRoom({ currentUserRole: "owner" }))).toBe(true);
  });

  it("prevents non-owners from deleting rooms", () => {
    expect(canDeleteRoom(createRoom({ currentUserRole: "admin" }))).toBe(false);
    expect(canDeleteRoom(createRoom({ currentUserRole: "member" }))).toBe(
      false,
    );
    expect(canDeleteRoom(createRoom({ currentUserRole: null }))).toBe(false);
  });

  it("picks a safe next room after deleting the active room", () => {
    const roomA = createRoom({ id: "room-a", isMember: true });
    const roomB = createRoom({ id: "room-b", isMember: true });
    const roomC = createRoom({ id: "room-c", isMember: false });

    expect(
      getNextRoomIdAfterDeletion([roomA, roomB, roomC], "room-a"),
    ).toBe("room-b");
    expect(getNextRoomIdAfterDeletion([roomA], "room-a")).toBeNull();
  });

  it("removes deleted rooms from the visible room list", () => {
    const roomA = createRoom({ id: "room-a" });
    const roomB = createRoom({ id: "room-b" });

    expect(removeRoomFromList([roomA, roomB], "room-a")).toEqual([roomB]);
  });
});
