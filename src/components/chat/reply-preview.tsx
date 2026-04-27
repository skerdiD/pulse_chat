import { CornerUpLeft } from "lucide-react";

type ReplyPreviewProps = {
  authorName: string;
  content: string;
  compact?: boolean;
};

export function ReplyPreview({
  authorName,
  content,
  compact = false,
}: ReplyPreviewProps) {
  return (
    <div
      className={
        compact
          ? "border-l border-purple-400/35 py-0.5 pl-3"
          : "rounded-xl border border-slate-800 bg-slate-950/70 p-3"
      }
    >
      <div className="flex items-center gap-2 text-[11px] font-medium text-purple-200">
        <CornerUpLeft className="size-3.5" />
        <span>{authorName}</span>
      </div>

      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500 sm:text-xs">
        {content}
      </p>
    </div>
  );
}
