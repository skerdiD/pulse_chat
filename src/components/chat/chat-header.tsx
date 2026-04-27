import {
  Hash,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Radio,
  Settings,
  UsersRound,
} from "lucide-react";

import { ProfileMenu } from "@/components/chat/profile-menu";
import { RealtimeStatus } from "@/components/chat/realtime-status";
import type {
  ChatRoom,
  CurrentChatUser,
  RealtimeConnectionStatus,
} from "@/types/chat";

type ChatHeaderProps = {
  room: ChatRoom;
  currentUser: CurrentChatUser;
  realtimeStatus: RealtimeConnectionStatus;
  onOpenRooms: () => void;
  onOpenRoomSettings: () => void;
};

export function ChatHeader({
  room,
  currentUser,
  realtimeStatus,
  onOpenRooms,
  onOpenRoomSettings,
}: ChatHeaderProps) {
  const roleLabel =
    room.currentUserRole === "owner"
      ? "Owner"
      : room.currentUserRole === "admin"
        ? "Admin"
        : room.isMember
          ? "Member"
          : "Viewer";

  return (
    <header className="relative z-20 flex h-20 shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-950/72 px-3 shadow-xl shadow-black/10 backdrop-blur-xl sm:px-6 lg:h-[76px]">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenRooms}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 transition hover:border-purple-400/30 hover:bg-slate-900 hover:text-white lg:hidden"
          aria-label="Open rooms"
        >
          <Menu className="size-4" />
        </button>

        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/20 sm:size-12">
          {room.visibility === "private" ? (
            <LockKeyhole className="size-5" />
          ) : (
            <Hash className="size-5" />
          )}
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-base font-black tracking-[-0.03em] text-white sm:text-xl">
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

            <span className="hidden rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-xs font-black text-purple-200 md:inline-flex">
              {roleLabel}
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
          className="hidden size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-purple-400/30 hover:bg-slate-900 hover:text-white md:flex"
          aria-label="More room actions"
        >
          <MoreHorizontal className="size-4" />
        </button>

        <button
          type="button"
          onClick={onOpenRoomSettings}
          className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-purple-400/30 hover:bg-slate-900 hover:text-white"
          aria-label="Open room settings"
        >
          <Settings className="size-4" />
        </button>

        <ProfileMenu currentUser={currentUser} compact />
      </div>
    </header>
  );
}
