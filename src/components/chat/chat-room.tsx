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
  CurrentChatUser,
} from "@/types/chat";

type ChatRoomProps = {
  room: ChatRoomType;
  messages: ChatMessage[];
  currentUser: CurrentChatUser;
  canSendMessages: boolean;
  onOpenRooms: () => void;
  onRoomDeleted: (roomId: string) => void;
};

export function ChatRoom({
  room,
  messages: initialMessages,
  currentUser,
  canSendMessages,
  onOpenRooms,
  onRoomDeleted,
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
    addOptimisticMessage,
    confirmOptimisticMessage,
    failOptimisticMessage,
    applyMessageUpdate,
    toggleMessageReactionOptimistically,
    removeMessage,
  } = useRoomRealtime({
    roomId: room.id,
    initialMessages,
    currentUser,
    enabled: canSendMessages,
  });

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ChatHeader
        room={room}
        currentUser={currentUser}
        realtimeStatus={realtimeStatus}
        onOpenRooms={onOpenRooms}
        onRoomDeleted={onRoomDeleted}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        roomName={room.name}
        typingUsers={typingUsers}
        onReply={handleReply}
        onMessageUpdated={applyMessageUpdate}
        onReactionToggle={toggleMessageReactionOptimistically}
        onMessageDeleted={removeMessage}
      />

      {canSendMessages ? (
        <MessageComposer
          roomId={room.id}
          replyToMessage={replyToMessage}
          onCancelReply={clearReply}
          onMessageSent={clearReply}
          onTyping={sendTyping}
          onOptimisticMessage={addOptimisticMessage}
          onMessageConfirmed={confirmOptimisticMessage}
          onMessageFailed={failOptimisticMessage}
        />
      ) : (
        <div className="shrink-0 border-t border-slate-800/90 bg-slate-950/78 px-3 py-3 shadow-xl shadow-black/15 backdrop-blur-xl lg:px-6 xl:px-7">
          <div className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/95 p-3.5 text-sm font-medium text-slate-400">
            <LockKeyhole className="size-4 text-purple-300" />
            Join this room before sending messages.
          </div>
        </div>
      )}
    </div>
  );
}
