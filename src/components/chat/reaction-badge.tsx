"use client";

import { memo, useCallback, useTransition } from "react";
import { toast } from "sonner";

import { toggleReactionAction } from "@/server/actions/reactions";
import type { ChatMessageReactionSummary } from "@/types/chat";

type ReactionBadgeProps = {
  messageId: string;
  reaction: ChatMessageReactionSummary;
  onToggleReaction: (messageId: string, emoji: string) => (() => void) | null;
};

export const ReactionBadge = memo(function ReactionBadge({
  messageId,
  reaction,
  onToggleReaction,
}: ReactionBadgeProps) {
  const [isPending, startTransition] = useTransition();

  const toggleReaction = useCallback(() => {
    startTransition(async () => {
      const rollback = onToggleReaction(messageId, reaction.emoji);
      const result = await toggleReactionAction({
        messageId,
        emoji: reaction.emoji,
      });

      if (!result.ok) {
        rollback?.();
        toast.error(result.error.message);
        return;
      }
    });
  }, [messageId, onToggleReaction, reaction.emoji]);

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
          ? "inline-flex h-7 items-center gap-1.5 rounded-full border border-purple-400/25 bg-slate-900 px-2.5 text-[11px] font-medium text-purple-100 ring-1 ring-purple-400/15 shadow-sm shadow-black/20 transition hover:border-purple-400/35 disabled:pointer-events-none disabled:opacity-70"
          : "inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/75 px-2.5 text-[11px] font-medium text-slate-300 transition hover:border-purple-400/25 hover:bg-slate-900 hover:text-purple-100 disabled:pointer-events-none disabled:opacity-70"
      }
    >
      <span aria-hidden="true">{reaction.emoji}</span>
      <span>{reaction.count}</span>
    </button>
  );
}, areReactionBadgePropsEqual);

function areReactionBadgePropsEqual(
  previous: ReactionBadgeProps,
  next: ReactionBadgeProps,
) {
  return (
    previous.messageId === next.messageId &&
    previous.reaction.emoji === next.reaction.emoji &&
    previous.reaction.count === next.reaction.count &&
    previous.reaction.reactedByCurrentUser ===
      next.reaction.reactedByCurrentUser &&
    previous.onToggleReaction === next.onToggleReaction
  );
}
