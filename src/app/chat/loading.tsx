import { Loader2 } from "lucide-react";

export default function ChatLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 text-white">
      <div className="rounded-[2rem] border border-slate-800/90 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
          <Loader2 className="size-6 animate-spin" />
        </div>

        <h1 className="text-xl font-black tracking-[-0.03em]">
          Loading Pulse Chat
        </h1>

        <p className="mt-2 text-sm font-medium text-slate-400">
          Preparing your rooms...
        </p>
      </div>
    </main>
  );
}