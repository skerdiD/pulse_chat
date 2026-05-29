import type {
  messageReactions,
  messages,
  profiles,
  roomMembers,
  rooms,
} from "@/db/schema";

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type RoomMember = typeof roomMembers.$inferSelect;
export type NewRoomMember = typeof roomMembers.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type MessageReaction = typeof messageReactions.$inferSelect;
export type NewMessageReaction = typeof messageReactions.$inferInsert;

export type RoomVisibility = Room["visibility"];
export type RoomMemberRole = RoomMember["role"];

export type PublicProfile = Pick<
  Profile,
  "id" | "username" | "avatarUrl" | "createdAt" | "updatedAt"
>;

export type RoomWithMemberCount = Room & {
  memberCount: number;
  unreadCount: number;
};

export type MessageWithAuthorAndReactions = Message & {
  author: PublicProfile;
  reactions: Array<
    Pick<MessageReaction, "id" | "messageId" | "userId" | "emoji" | "createdAt">
  >;
  replyToMessage?: Message | null;
};
