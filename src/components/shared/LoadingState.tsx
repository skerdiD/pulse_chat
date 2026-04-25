// src/components/shared/LoadingState.tsx
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Loading Pulse Chat...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center gap-4 px-4 py-10 text-center",
        className,
      )}
    >
      <div className="relative">
        <div className="size-12 rounded-2xl border border-purple-400/30 bg-purple-500/10" />
        <div className="absolute inset-0 animate-ping rounded-2xl bg-purple-500/20" />
        <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-600 shadow-lg shadow-purple-500/25" />
      </div>

      <p className="text-sm font-bold text-slate-400">{label}</p>
    </div>
  );
}