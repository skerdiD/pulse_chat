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
  onMessageUpdated: (
    messageId: string,
    updates: Pick<ChatMessage, "content" | "isEdited" | "updatedAt">,
  ) => void;
  onMessageDeleted: (messageId: string) => void;
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
    <div className="px-2 py-1.5">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/85 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 shadow-lg shadow-black/15">
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
  onMessageUpdated,
  onMessageDeleted,
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
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8">
        <div className="rounded-[1.75rem] border border-slate-800/90 bg-slate-950/72 p-7 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-purple-400/15 bg-purple-500/10 text-purple-200">
            <Loader2 className="size-6 animate-spin" />
          </div>

          <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_34rem)]" />

        <div className="relative w-full max-w-lg rounded-[1.75rem] border border-slate-800/90 bg-slate-950/72 p-7 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-3xl border border-purple-400/15 bg-purple-500/10 text-purple-200 shadow-lg shadow-purple-500/5">
            <MessageSquareText className="size-6" />
          </div>

          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            Start the conversation.
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
            No messages in{" "}
            <span className="font-semibold text-slate-200">{roomName}</span> yet.
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
        className="pulse-scrollbar h-full overflow-y-auto px-3 py-4 sm:px-4 lg:px-5"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-0.5">
          {groupedMessages.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <div className="sticky top-2 z-10 my-3 flex justify-center">
                <span className="rounded-full border border-slate-800 bg-slate-950/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 shadow-lg shadow-black/15 backdrop-blur-xl">
                  {group.label}
                </span>
              </div>

              <div className="space-y-0.5">
                {group.messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                    isOwnMessage={message.userId === currentUserId}
                    onReply={() => onReply(message)}
                    onMessageUpdated={onMessageUpdated}
                    onMessageDeleted={onMessageDeleted}
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
            className="pointer-events-auto rounded-full border border-purple-400/20 bg-slate-900/95 px-3.5 py-1.5 text-[11px] font-semibold text-purple-100 shadow-xl shadow-black/25 ring-1 ring-purple-400/20 transition hover:-translate-y-0.5 hover:bg-slate-900"
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
