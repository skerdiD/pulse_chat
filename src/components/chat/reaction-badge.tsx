"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { toggleReactionAction } from "@/server/actions/reactions";
import type { ChatMessageReactionSummary } from "@/types/chat";

type ReactionBadgeProps = {
  messageId: string;
  reaction: ChatMessageReactionSummary;
};

export function ReactionBadge({ messageId, reaction }: ReactionBadgeProps) {
  const [isPending, startTransition] = useTransition();

  function toggleReaction() {
    startTransition(async () => {
      const result = await toggleReactionAction({
        messageId,
        emoji: reaction.emoji,
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggleReaction}
      disabled={isPending}
      aria-pressed={reaction.reactedByCurrentUser}
      aria-label={
        reaction.reactedByCurrentUser
          ? `Remove ${reaction.emoji} reaction`
          : `Add ${reaction.emoji} reaction`
      }
      className={
        reaction.reactedByCurrentUser
          ? "inline-flex h-8 items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/20 px-3 text-xs font-black text-purple-100 shadow-lg shadow-purple-500/10 transition hover:bg-purple-500/30 disabled:pointer-events-none disabled:opacity-70"
          : "inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 text-xs font-bold text-slate-300 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-purple-100 disabled:pointer-events-none disabled:opacity-70"
      }
    >
      <span aria-hidden="true">{reaction.emoji}</span>
      <span>{reaction.count}</span>
    </button>
  );
}
