"use client";

export const QUICK_REACTION_EMOJIS = [
  "\u{1F44D}",
  "\u{2764}\u{FE0F}",
  "\u{1F602}",
  "\u{1F389}",
  "\u{1F525}",
  "\u{1F440}",
] as const;

type ReactionPickerProps = {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
  align?: "left" | "right";
};

export function ReactionPicker({
  onSelect,
  disabled = false,
  align = "right",
}: ReactionPickerProps) {
  return (
    <div
      className={
        align === "right"
          ? "absolute right-0 bottom-[calc(100%+0.5rem)] z-40 rounded-full border border-slate-800 bg-slate-950 p-1.5 shadow-2xl shadow-black/40"
          : "absolute left-0 bottom-[calc(100%+0.5rem)] z-40 rounded-full border border-slate-800 bg-slate-950 p-1.5 shadow-2xl shadow-black/40"
      }
    >
      <div className="flex items-center gap-1 whitespace-nowrap">
        {QUICK_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(emoji)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[1.35rem] leading-none transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-60"
            aria-label={`React with ${emoji}`}
          >
            <span aria-hidden="true" className="leading-none">
              {emoji}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
