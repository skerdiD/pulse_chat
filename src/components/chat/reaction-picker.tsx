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
          ? "absolute right-0 top-10 z-30 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black/40"
          : "absolute left-0 top-10 z-30 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black/40"
      }
    >
      <div className="grid grid-cols-6 gap-1">
        {QUICK_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(emoji)}
            className="flex size-9 items-center justify-center rounded-xl text-lg transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-60"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
