import type { ChatRoom } from "@/types/chat";

type RoomIdentity = Pick<ChatRoom, "id" | "isMember">;
type RoomDeletionRole = Pick<ChatRoom, "currentUserRole">;

export function canDeleteRoom(room: RoomDeletionRole) {
  return room.currentUserRole === "owner";
}

export function removeRoomFromList<T extends RoomIdentity>(
  rooms: T[],
  deletedRoomId: string,
) {
  return rooms.filter((room) => room.id !== deletedRoomId);
}

export function getNextRoomIdAfterDeletion(
  rooms: RoomIdentity[],
  deletedRoomId: string,
) {
  const remainingRooms = removeRoomFromList(rooms, deletedRoomId);

  return remainingRooms.find((room) => room.isMember)?.id ?? remainingRooms[0]?.id ?? null;
}
