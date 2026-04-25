import {
  Hash,
  LockKeyhole,
  MoreHorizontal,
  Radio,
  Settings,
  UsersRound,
} from "lucide-react";

import { RealtimeStatus } from "@/components/chat/realtime-status";
import type { ChatRoom, RealtimeConnectionStatus } from "@/types/chat";

type ChatHeaderProps = {
  room: ChatRoom;
  realtimeStatus: RealtimeConnectionStatus;
};

export function ChatHeader({ room, realtimeStatus }: ChatHeaderProps) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-950/60 px-4 backdrop-blur-xl sm:px-6 lg:h-[76px]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
          {room.visibility === "private" ? (
            <LockKeyhole className="size-5" />
          ) : (
            <Hash className="size-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-lg font-black tracking-[-0.03em] text-white sm:text-xl">
              {room.name}
            </h1>

            <span className="hidden items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold capitalize text-slate-400 sm:inline-flex">
              {room.visibility === "private" ? (
                <LockKeyhole className="size-3 text-purple-300" />
              ) : (
                <Radio className="size-3 text-emerald-300" />
              )}
              {room.visibility}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <UsersRound className="size-3.5" />
              {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
            </span>

            {room.description ? (
              <span className="hidden max-w-xl truncate md:inline">
                {room.description}
              </span>
            ) : (
              <span className="hidden md:inline">No description yet</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <RealtimeStatus status={realtimeStatus} />

        <button
          type="button"
          className="hidden size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-purple-400/30 hover:text-white sm:flex"
          aria-label="More room actions"
        >
          <MoreHorizontal className="size-4" />
        </button>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-purple-400/30 hover:text-white"
          aria-label="Room settings"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </header>
  );
}