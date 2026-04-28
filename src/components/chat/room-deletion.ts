import type { ChatRoom } from "@/types/chat";

type RoomIdentity = Pick<ChatRoom, "id" | "isMember">;
type RoomDeletionRole = Pick<ChatRoom, "currentUserRole">;

export function canManageRoom(room: RoomDeletionRole) {
  return room.currentUserRole === "owner";
}

export function canDeleteRoom(room: RoomDeletionRole) {
  return canManageRoom(room);
}

export function canEditRoom(room: RoomDeletionRole) {
  return canManageRoom(room);
}

export function getRoomSettingsHref(roomId: string) {
  return `/chat/rooms/${roomId}/settings`;
}

export function getRoomChatHref(roomId: string) {
  return `/chat?room=${roomId}`;
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
