"use client";

import { useCallback, useState } from "react";
import { LockKeyhole } from "lucide-react";

import { ChatHeader } from "@/components/chat/chat-header";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { useRoomRealtime } from "@/hooks/use-room-realtime";
import type {
  ChatMessage,
  ChatMessageReplyPreview,
  ChatRoom as ChatRoomType,
  ChatRoomMember,
  CurrentChatUser,
} from "@/types/chat";

type ChatRoomProps = {
  room: ChatRoomType;
  messages: ChatMessage[];
  members: ChatRoomMember[];
  currentUser: CurrentChatUser;
  canSendMessages: boolean;
  onOpenRooms: () => void;
};

export function ChatRoom({
  room,
  messages: initialMessages,
  members,
  currentUser,
  canSendMessages,
  onOpenRooms,
}: ChatRoomProps) {
  const [replyToMessage, setReplyToMessage] =
    useState<ChatMessageReplyPreview | null>(null);
  const clearReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);
  const handleReply = useCallback((message: ChatMessage) => {
    setReplyToMessage({
      id: message.id,
      content: message.content,
      authorUsername: message.author.username,
      createdAt: message.createdAt,
    });
  }, []);

  const {
    messages,
    status: realtimeStatus,
    typingUsers,
    sendTyping,
  } = useRoomRealtime({
    roomId: room.id,
    initialMessages,
    currentUser,
    enabled: canSendMessages,
  });

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <ChatHeader
        room={room}
        members={members}
        currentUser={currentUser}
        realtimeStatus={realtimeStatus}
        onOpenRooms={onOpenRooms}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        roomName={room.name}
        typingUsers={typingUsers}
        onReply={handleReply}
      />

      {canSendMessages ? (
        <MessageComposer
          roomId={room.id}
          replyToMessage={replyToMessage}
          onCancelReply={clearReply}
          onMessageSent={clearReply}
          onTyping={sendTyping}
        />
      ) : (
        <div className="shrink-0 border-t border-slate-800/90 bg-slate-950/72 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm font-semibold text-slate-400">
            <LockKeyhole className="size-4 text-purple-300" />
            Join this room before sending messages.
          </div>
        </div>
      )}
    </div>
  );
}
