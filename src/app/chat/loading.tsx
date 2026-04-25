import { Loader2 } from "lucide-react";

export default function ChatLoading() {
  return (
    <main className="flex min-h-screen overflow-hidden bg-[#050816] text-white">
      <aside className="hidden w-[340px] shrink-0 border-r border-slate-800/90 bg-slate-950/80 p-4 lg:block">
        <div className="mb-6 flex items-center gap-3">
          <div className="pulse-skeleton size-11 rounded-2xl" />
          <div className="space-y-2">
            <div className="pulse-skeleton h-4 w-28 rounded-full" />
            <div className="pulse-skeleton h-3 w-20 rounded-full" />
          </div>
        </div>

        <div className="pulse-skeleton mb-5 h-11 rounded-xl" />

        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-3"
            >
              <div className="flex gap-3">
                <div className="pulse-skeleton size-11 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="pulse-skeleton h-4 w-28 rounded-full" />
                  <div className="pulse-skeleton h-3 w-20 rounded-full" />
                  <div className="pulse-skeleton h-3 w-40 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-950/60 px-4 sm:px-6 lg:h-[76px]">
          <div className="flex items-center gap-3">
            <div className="pulse-skeleton size-12 rounded-2xl" />
            <div className="space-y-2">
              <div className="pulse-skeleton h-5 w-36 rounded-full" />
              <div className="pulse-skeleton h-3 w-52 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="pulse-skeleton hidden h-10 w-20 rounded-xl sm:block" />
            <div className="pulse-skeleton size-10 rounded-xl" />
            <div className="pulse-skeleton size-10 rounded-xl" />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-10">
          <div className="rounded-[2rem] border border-slate-800/90 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
              <Loader2 className="size-6 animate-spin" />
            </div>

            <h1 className="text-xl font-black tracking-[-0.03em] text-white">
              Loading Pulse Chat
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-400">
              Preparing your rooms and messages...
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}