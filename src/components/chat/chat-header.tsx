import {
  Hash,
  LockKeyhole,
  Menu,
  Radio,
  Sparkles,
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
};

export function ChatHeader({
  room,
  currentUser,
  realtimeStatus,
  onOpenRooms,
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
    <header className="relative z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-950/78 px-3 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-5 lg:h-[70px]">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenRooms}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 transition hover:border-purple-400/25 hover:bg-slate-900 hover:text-white lg:hidden"
          aria-label="Open rooms"
        >
          <Menu className="size-4" />
        </button>

        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/85 text-purple-200 shadow-md shadow-black/20 sm:size-11">
          {room.visibility === "private" ? (
            <LockKeyhole className="size-[1.125rem]" />
          ) : (
            <Hash className="size-[1.125rem]" />
          )}

          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white sm:text-lg">
              {room.name}
            </h1>

            <span className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-400 sm:inline-flex">
              {room.visibility === "private" ? (
                <LockKeyhole className="size-3 text-purple-300" />
              ) : (
                <Radio className="size-3 text-emerald-300" />
              )}

              {room.visibility}
            </span>

            <span className="hidden rounded-full border border-purple-400/15 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-purple-200 md:inline-flex">
              {roleLabel}
            </span>
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium text-slate-500 sm:text-xs">
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

        <div
          aria-hidden="true"
          className="hidden h-9 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/75 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 shadow-md shadow-black/15 md:flex"
        >
          <Sparkles className="size-3.5 text-purple-300" />
          Active
        </div>

        <ProfileMenu currentUser={currentUser} compact />
      </div>
    </header>
  );
}
