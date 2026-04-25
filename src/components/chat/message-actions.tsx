"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  CornerUpLeft,
  MoreHorizontal,
  Pencil,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ReactionPicker } from "@/components/chat/reaction-picker";
import { toggleReactionAction } from "@/server/actions/reactions";

type MessageActionsProps = {
  messageId: string;
  messageContent: string;
  onReply: () => void;
  variant?: "desktop" | "mobile";
};

export function MessageActions({
  messageId,
  messageContent,
  onReply,
  variant = "desktop",
}: MessageActionsProps) {
  const router = useRouter();
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
        setIsMoreOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
        setIsMoreOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function copyMessage() {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(messageContent);
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

  function toggleReaction(emoji: string) {
    startTransition(async () => {
      const result = await toggleReactionAction({
        messageId,
        emoji,
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      setIsPickerOpen(false);
      router.refresh();
    });
  }

  function showComingSoon(label: string) {
    toast.info(`${label} can be added later with protected server actions.`);
    setIsMoreOpen(false);
  }

  const buttonClass =
    variant === "desktop"
      ? "flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-60"
      : "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/70 px-3 text-xs font-bold text-slate-400 transition hover:border-slate-700 hover:text-white disabled:pointer-events-none disabled:opacity-60";

  return (
    <div
      ref={actionsRef}
      className={
        variant === "desktop"
          ? "absolute right-3 top-2 hidden items-center gap-1 rounded-2xl border border-slate-800 bg-slate-950/95 p-1 opacity-0 shadow-2xl shadow-black/30 backdrop-blur-xl transition group-hover:opacity-100 group-focus-within:opacity-100 sm:flex"
          : "relative mt-3 flex flex-wrap gap-2 pl-[52px] sm:hidden"
      }
    >
      <button
        type="button"
        onClick={onReply}
        className={buttonClass}
        aria-label="Reply to message"
      >
        <CornerUpLeft className="size-4" />
        {variant === "mobile" ? <span>Reply</span> : null}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsPickerOpen((current) => !current);
            setIsMoreOpen(false);
          }}
          disabled={isPending}
          className={buttonClass}
          aria-label="React to message"
          aria-expanded={isPickerOpen}
        >
          <SmilePlus className="size-4" />
          {variant === "mobile" ? <span>React</span> : null}
        </button>

        {isPickerOpen ? (
          <ReactionPicker
            onSelect={toggleReaction}
            disabled={isPending}
            align={variant === "desktop" ? "right" : "left"}
          />
        ) : null}
      </div>

      <button
        type="button"
        onClick={copyMessage}
        disabled={isPending}
        className={buttonClass}
        aria-label="Copy message"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {variant === "mobile" ? (
          <span>{copied ? "Copied" : "Copy"}</span>
        ) : null}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsMoreOpen((current) => !current);
            setIsPickerOpen(false);
          }}
          className={buttonClass}
          aria-label="More message actions"
          aria-expanded={isMoreOpen}
        >
          <MoreHorizontal className="size-4" />
          {variant === "mobile" ? <span>More</span> : null}
        </button>

        {isMoreOpen ? (
          <div
            role="menu"
            className={
              variant === "desktop"
                ? "absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-black/40"
                : "absolute bottom-11 left-0 z-30 w-44 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-black/40"
            }
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => showComingSoon("Edit message")}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <Pencil className="size-3.5" />
              Edit placeholder
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => showComingSoon("Delete message")}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <Trash2 className="size-3.5" />
              Delete placeholder
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}