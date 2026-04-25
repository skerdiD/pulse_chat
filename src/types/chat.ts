export type CurrentChatUser = {
  id: string;
  email: string;
  username: string;
};

export type ChatRoomVisibility = "public" | "private";

export type ChatRoomMemberRole = "owner" | "admin" | "member";

export type ChatLatestMessagePreview = {
  id: string;
  content: string;
  createdAt: string;
  authorUsername: string;
};

export type ChatRoom = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  visibility: ChatRoomVisibility;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  isMember: boolean;
  currentUserRole: ChatRoomMemberRole | null;
  latestMessagePreview: ChatLatestMessagePreview | null;
};

export type ChatMessageAuthor = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type ChatMessageReplyPreview = {
  id: string;
  content: string;
  authorUsername: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  userId: string;
  replyToMessageId: string | null;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: ChatMessageAuthor;
  replyToMessage: ChatMessageReplyPreview | null;
};