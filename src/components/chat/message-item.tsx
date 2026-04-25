"use client";

import {
  Check,
  Copy,
  CornerUpLeft,
  MoreHorizontal,
  SmilePlus,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ReplyPreview } from "@/components/chat/reply-preview";
import type { ChatMessage } from "@/types/chat";

type MessageItemProps = {
  message: ChatMessage;
  isOwnMessage: boolean;
  onReply: () => void;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(username: string) {
  return username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MessageItem({ message, isOwnMessage, onReply }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isCopying, startCopyTransition] = useTransition();

  function copyMessage() {
    startCopyTransition(async () => {
      try {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        toast.success("Message copied.");

        window.setTimeout(() => {
          setCopied(false);
        }, 1200);
      } catch {
        toast.error("Unable to copy message.");
      }
    });
  }

  function reactPlaceholder() {
    toast.info("Emoji reactions are coming next.");
  }

  return (
    <article className="group relative rounded-3xl px-2 py-3 transition hover:bg-slate-900/45 sm:px-3">
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

            <span className="text-xs font-semibold text-slate-500">
              {formatMessageTime(message.createdAt)}
            </span>

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
        </div>

        <div className="absolute right-3 top-2 hidden items-center gap-1 rounded-2xl border border-slate-800 bg-slate-950/95 p-1 opacity-0 shadow-2xl shadow-black/30 backdrop-blur-xl transition group-hover:opacity-100 sm:flex">
          <button
            type="button"
            onClick={onReply}
            className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Reply to message"
          >
            <CornerUpLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={copyMessage}
            disabled={isCopying}
            className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
            aria-label="Copy message"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>

          <button
            type="button"
            onClick={reactPlaceholder}
            className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="React to message"
          >
            <SmilePlus className="size-4" />
          </button>

          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="More message actions"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2 pl-[52px] sm:hidden">
        <button
          type="button"
          onClick={onReply}
          className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-bold text-slate-400"
        >
          Reply
        </button>

        <button
          type="button"
          onClick={copyMessage}
          className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-bold text-slate-400"
        >
          Copy
        </button>

        <button
          type="button"
          onClick={reactPlaceholder}
          className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-bold text-slate-400"
        >
          React
        </button>
      </div>
    </article>
  );
}