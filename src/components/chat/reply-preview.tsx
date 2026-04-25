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
          ? "border-l-2 border-purple-400/50 py-1 pl-3"
          : "rounded-2xl border border-slate-800 bg-slate-950/70 p-3"
      }
    >
      <div className="flex items-center gap-2 text-xs font-black text-purple-200">
        <CornerUpLeft className="size-3.5" />
        <span>{authorName}</span>
      </div>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
        {content}
      </p>
    </div>
  );
}