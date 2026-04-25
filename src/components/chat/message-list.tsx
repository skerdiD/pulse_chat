"use client";

import { useMemo } from "react";
import { Loader2, MessageSquareText } from "lucide-react";

import { MessageItem } from "@/components/chat/message-item";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { formatMessageDateLabel } from "@/lib/format";
import type { ChatMessage, TypingUser } from "@/types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  roomName: string;
  typingUsers: TypingUser[];
  isLoading?: boolean;
  onReply: (message: ChatMessage) => void;
};

function getTypingText(users: TypingUser[]) {
  if (users.length === 1) {
    return `${users[0].username} is typing`;
  }

  if (users.length === 2) {
    return `${users[0].username} and ${users[1].username} are typing`;
  }

  return "Several people are typing";
}

function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="px-3 py-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/85 px-3 py-2 text-xs font-bold text-slate-400 shadow-xl shadow-black/20">
        <span>{getTypingText(users)}</span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:-0.2s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:-0.1s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-purple-300" />
        </span>
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  currentUserId,
  roomName,
  typingUsers,
  isLoading = false,
  onReply,
}: MessageListProps) {
  const latestMessage = messages.at(-1) ?? null;

  const groupedMessages = useMemo(() => {
    const groups: Array<{
      label: string;
      messages: ChatMessage[];
    }> = [];

    for (const message of messages) {
      const label = formatMessageDateLabel(message.createdAt);
      const lastGroup = groups.at(-1);

      if (lastGroup?.label === label) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          label,
          messages: [message],
        });
      }
    }

    return groups;
  }, [messages]);

  const {
    containerRef,
    bottomRef,
    handleScroll,
    newItemsCount,
    scrollToBottom,
  } = useScrollAnchor({
    itemCount: messages.length,
    latestItemId: latestMessage?.id ?? null,
    latestItemUserId: latestMessage?.userId ?? null,
    currentUserId,
  });

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

          <TypingIndicator users={typingUsers} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="pulse-scrollbar h-full overflow-y-auto px-3 py-5 sm:px-5 lg:px-6"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1">
          {groupedMessages.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <div className="sticky top-2 z-10 my-4 flex justify-center">
                <span className="rounded-full border border-slate-800 bg-slate-950/85 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 shadow-xl shadow-black/20 backdrop-blur-xl">
                  {group.label}
                </span>
              </div>

              <div className="space-y-1">
                {group.messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                    isOwnMessage={message.userId === currentUserId}
                    onReply={() => onReply(message)}
                  />
                ))}
              </div>
            </section>
          ))}

          <TypingIndicator users={typingUsers} />

          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {newItemsCount > 0 ? (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="pointer-events-auto rounded-full border border-purple-400/30 bg-purple-500 px-4 py-2 text-xs font-black text-white shadow-2xl shadow-purple-500/30 transition hover:-translate-y-0.5 hover:bg-purple-400"
          >
            {newItemsCount === 1
              ? "1 new message"
              : `${newItemsCount} new messages`}
          </button>
        </div>
      ) : null}
    </div>
  );
}