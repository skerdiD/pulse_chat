"use client";

import { memo } from "react";

import { MessageActions } from "@/components/chat/message-actions";
import { ReactionBadge } from "@/components/chat/reaction-badge";
import { ReplyPreview } from "@/components/chat/reply-preview";
import { formatMessageTime, getInitials } from "@/lib/format";
import type { ChatMessage } from "@/types/chat";

type MessageItemProps = {
  message: ChatMessage;
  currentUserId: string;
  isOwnMessage: boolean;
  onReply: () => void;
};

export const MessageItem = memo(function MessageItem({
  message,
  isOwnMessage,
  onReply,
}: MessageItemProps) {
  const reactions = [...message.reactions].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.emoji.localeCompare(b.emoji);
  });

  return (
    <article className="group relative rounded-3xl px-2 py-3 transition duration-150 hover:bg-slate-900/45 sm:px-3">
      <div className="flex gap-3">
        <div className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-fuchsia-600 text-xs font-black text-white shadow-lg shadow-purple-500/20 sm:size-11">
          {message.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.author.avatarUrl}
              alt={`${message.author.username} avatar`}
              className="size-full rounded-full object-cover"
            />
          ) : (
            getInitials(message.author.username)
          )}

          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#050816] bg-emerald-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-black tracking-[-0.01em] text-white">
              {message.author.username}
            </h3>

            <time
              dateTime={message.createdAt}
              className="text-xs font-semibold text-slate-500"
            >
              {formatMessageTime(message.createdAt)}
            </time>

            {message.isEdited ? (
              <span className="text-xs font-semibold text-slate-600">
                edited
              </span>
            ) : null}

            {isOwnMessage ? (
              <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-black text-purple-200">
                You
              </span>
            ) : null}
          </div>

          {message.replyToMessage ? (
            <div className="mt-2 max-w-2xl">
              <ReplyPreview
                authorName={message.replyToMessage.authorUsername}
                content={message.replyToMessage.content}
                compact
              />
            </div>
          ) : null}

          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">
            {message.content}
          </p>

          {reactions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {reactions.map((reaction) => (
                <ReactionBadge
                  key={reaction.emoji}
                  messageId={message.id}
                  reaction={reaction}
                />
              ))}
            </div>
          ) : null}
        </div>

        <MessageActions
          messageId={message.id}
          messageContent={message.content}
          onReply={onReply}
          variant="desktop"
        />
      </div>

      <MessageActions
        messageId={message.id}
        messageContent={message.content}
        onReply={onReply}
        variant="mobile"
      />
    </article>
  );
}, areMessageItemPropsEqual);

function areMessageItemPropsEqual(
  previous: MessageItemProps,
  next: MessageItemProps,
) {
  return (
    previous.message === next.message &&
    previous.currentUserId === next.currentUserId &&
    previous.isOwnMessage === next.isOwnMessage
  );
}
