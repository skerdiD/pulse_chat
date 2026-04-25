import { MessageSquareText } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 via-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25">
        <MessageSquareText className="size-5" />
        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
      </div>

      <div className="leading-none">
        <p className="text-lg font-black tracking-[-0.04em] text-white">
          Pulse Chat
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200/70">
          Realtime
        </p>
      </div>
    </div>
  );
}