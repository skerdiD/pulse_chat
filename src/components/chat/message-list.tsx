"use client";

import { useEffect, useMemo, useRef } from "react";
import { Loader2, MessageSquareText } from "lucide-react";

import { MessageItem } from "@/components/chat/message-item";
import type { ChatMessage } from "@/types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  roomName: string;
  isLoading?: boolean;
  onReply: (message: ChatMessage) => void;
};

export function MessageList({
  messages,
  currentUserId,
  roomName,
  isLoading = false,
  onReply,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const latestMessageId = messages.at(-1)?.id;

  const groupedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [latestMessageId]);

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-10">
        <div className="rounded-[2rem] border border-slate-800/90 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
            <Loader2 className="size-6 animate-spin" />
          </div>

          <h2 className="text-xl font-black tracking-[-0.03em]">
            Loading messages
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-400">
            Preparing the conversation...
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_34rem)]" />

        <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-800/90 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl border border-purple-400/20 bg-purple-500/10 text-purple-200 shadow-xl shadow-purple-500/10">
            <MessageSquareText className="size-7" />
          </div>

          <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
            Start the conversation.
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
            No messages in{" "}
            <span className="font-bold text-slate-200">{roomName}</span> yet.
            Send the first message and make this room feel alive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pulse-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1">
        {groupedMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.userId === currentUserId}
            onReply={() => onReply(message)}
          />
        ))}

        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}