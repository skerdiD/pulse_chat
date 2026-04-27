import { MessageSquareText } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex size-10 items-center justify-center rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500 via-purple-500 to-fuchsia-600 text-white shadow-md shadow-purple-500/18">
        <MessageSquareText className="size-[1.125rem]" />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
      </div>

      <div className="leading-none">
        <p className="text-[17px] font-semibold tracking-[-0.03em] text-white">
          Pulse Chat
        </p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
          Realtime
        </p>
      </div>
    </div>
  );
}
