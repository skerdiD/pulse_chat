import { MessageSquarePlus, Sparkles } from "lucide-react";

import { CreateRoomDialog } from "@/components/chat/create-room-dialog";

export function ChatEmptyState() {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-8">
      <div className="pulse-grid-bg pointer-events-none absolute inset-0 opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_34rem)]" />

      <div className="relative w-full max-w-lg rounded-[1.75rem] border border-slate-800/90 bg-slate-950/78 p-7 text-center shadow-2xl shadow-black/35 backdrop-blur-xl">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-3xl border border-purple-400/15 bg-purple-500/10 text-purple-200 shadow-lg shadow-purple-500/5">
          <MessageSquarePlus className="size-6" />
        </div>

        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-300">
          <Sparkles className="size-3.5 text-purple-300" />
          Premium realtime workspace
        </div>

        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          Create your first room.
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
          Rooms keep conversations organized by topic, team, project, or
          community. Start with a public room now, or create a private room for
          invite-only conversations later.
        </p>

        <div className="mt-6 flex justify-center">
          <CreateRoomDialog />
        </div>
      </div>
    </div>
  );
}
