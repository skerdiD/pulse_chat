"use client";

import { useMemo, useState } from "react";
import { LockKeyhole, MessageSquareText } from "lucide-react";

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
};

export function ChatRoom({
  room,
  messages,
  currentUser,
  canSendMessages,
}: ChatRoomProps) {
  const [replyTarget, setReplyTarget] =
    useState<ChatMessageReplyPreview | null>(null);

  const {
    messages: liveMessages,
    status,
    typingUsers,
    sendTyping,
  } = useRoomRealtime({
    roomId: room.id,
    initialMessages: messages,
    currentUser,
    enabled: canSendMessages,
  });

  const selectedReplyTarget = useMemo(() => replyTarget, [replyTarget]);

  function handleReply(message: ChatMessage) {
    setReplyTarget({
      id: message.id,
      content: message.content,
      authorUsername: message.author.username,
      createdAt: message.createdAt,
    });
  }

  return (
    <>
      <ChatHeader room={room} realtimeStatus={status} />

      {canSendMessages ? (
        <>
          <MessageList
            messages={liveMessages}
            currentUserId={currentUser.id}
            roomName={room.name}
            typingUsers={typingUsers}
            onReply={handleReply}
          />

          <MessageComposer
            key={room.id}
            roomId={room.id}
            replyToMessage={selectedReplyTarget}
            onCancelReply={() => setReplyTarget(null)}
            onMessageSent={() => setReplyTarget(null)}
            onTyping={sendTyping}
          />
        </>
      ) : (
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_34rem)]" />

          <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-800/90 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl border border-purple-400/20 bg-purple-500/10 text-purple-200 shadow-xl shadow-purple-500/10">
              {room.visibility === "private" ? (
                <LockKeyhole className="size-7" />
              ) : (
                <MessageSquareText className="size-7" />
              )}
            </div>

            <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
              Join this room to chat.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              You can view public rooms in the sidebar. Join a public room first
              to read and send messages. Private invite flows can be connected
              later.
            </p>
          </div>
        </div>
      )}
    </>
  );
}