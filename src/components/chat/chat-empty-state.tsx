import { MessageSquarePlus, Sparkles } from "lucide-react";

import { CreateRoomDialog } from "@/components/chat/create-room-dialog";

export function ChatEmptyState() {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div className="pulse-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.16),transparent_34rem)]" />

      <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-800/90 bg-slate-950/75 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl border border-purple-400/20 bg-purple-500/10 text-purple-200 shadow-xl shadow-purple-500/10">
          <MessageSquarePlus className="size-7" />
        </div>

        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-black text-slate-300">
          <Sparkles className="size-3.5 text-purple-300" />
          Premium realtime workspace
        </div>

        <h1 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
          Create your first room.
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
          Rooms keep conversations organized by topic, team, project, or
          community. Start with a public room now, or create a private room for
          invite-only conversations later.
        </p>

        <div className="mt-7 flex justify-center">
          <CreateRoomDialog />
        </div>
      </div>
    </div>
  );
}