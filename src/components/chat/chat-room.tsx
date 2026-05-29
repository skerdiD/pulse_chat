"use client";

import { useCallback, useState } from "react";

import { LockKeyhole } from "lucide-react";

import { ChatHeader } from "@/components/chat/chat-header";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { useRoomRealtime } from "@/hooks/use-room-realtime";
import { getMessagesForRoom } from "@/server/actions/messages";
import type {
  ChatMessage,
  ChatMessagePageInfo,
  ChatMessageReplyPreview,
  ChatRoom as ChatRoomType,
  CurrentChatUser,
} from "@/types/chat";

type ChatRoomProps = {
  room: ChatRoomType;
  messages: ChatMessage[];
  messagePageInfo: ChatMessagePageInfo;
  currentUser: CurrentChatUser;
  canSendMessages: boolean;
  onOpenRooms: () => void;
  onRoomDeleted: (roomId: string) => void;
};

function sortMessagesChronologically(messages: ChatMessage[]) {
  return [...messages].sort((a, b) => {
    const createdAtDiff = Date.parse(a.createdAt) - Date.parse(b.createdAt);

    if (createdAtDiff !== 0) {
      return createdAtDiff;
    }

    return a.id.localeCompare(b.id);
  });
}

export function ChatRoom({
  room,
  messages: initialMessages,
  messagePageInfo: initialMessagePageInfo,
  currentUser,
  canSendMessages,
  onOpenRooms,
  onRoomDeleted,
}: ChatRoomProps) {
  const [pagedMessages, setPagedMessages] = useState(initialMessages);
  const [messagePageInfo, setMessagePageInfo] = useState(
    initialMessagePageInfo,
  );
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
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

  const loadOlderMessages = useCallback(async () => {
    if (
      isLoadingOlderMessages ||
      !messagePageInfo.hasMore ||
      !messagePageInfo.nextCursor
    ) {
      return;
    }

    setIsLoadingOlderMessages(true);

    try {
      const result = await getMessagesForRoom({
        roomId: room.id,
        cursor: messagePageInfo.nextCursor,
      });

      if (!result.ok) {
        return;
      }

      setPagedMessages((currentMessages) => {
        const messageById = new Map<string, ChatMessage>();

        for (const message of [...result.data.messages, ...currentMessages]) {
          messageById.set(message.id, message);
        }

        return sortMessagesChronologically(Array.from(messageById.values()));
      });
      setMessagePageInfo(result.data.pageInfo);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  }, [isLoadingOlderMessages, messagePageInfo, room.id]);

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
    initialMessages: pagedMessages,
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
        hasOlderMessages={messagePageInfo.hasMore}
        isLoadingOlderMessages={isLoadingOlderMessages}
        onLoadOlderMessages={loadOlderMessages}
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
