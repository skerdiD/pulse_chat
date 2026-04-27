"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Crown,
  Hash,
  LockKeyhole,
  Radio,
  Search,
  Settings,
  UsersRound,
  X,
} from "lucide-react";

import { CreateRoomDialog } from "@/components/chat/create-room-dialog";
import { InitialAvatar } from "@/components/chat/initial-avatar";
import { ProfileMenu } from "@/components/chat/profile-menu";
import { RoomItem } from "@/components/chat/room-item";
import { AppLogo } from "@/components/shared/AppLogo";
import type { ChatRoom, ChatRoomMember, CurrentChatUser } from "@/types/chat";

type RoomSidebarProps = {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  activeRoom: ChatRoom | null;
  members: ChatRoomMember[];
  currentUser: CurrentChatUser;
  mode: "profile" | "settings";
  onModeChange: (mode: "profile" | "settings") => void;
  isMobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
};

function SidebarSettingsPanel({
  room,
  members,
  currentUserId,
  onClose,
}: {
  room: ChatRoom | null;
  members: ChatRoomMember[];
  currentUserId: string;
  onClose: () => void;
}) {
  const currentMember = members.find((member) => member.userId === currentUserId);
  const shownMembers = members.slice(0, 4);

  return (
    <section
      aria-label="Room settings"
      className="max-h-80 overflow-hidden rounded-2xl border border-purple-400/20 bg-slate-950/90 shadow-2xl shadow-black/25"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/90 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
            <Settings className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-white">Settings</h2>
            <p className="truncate text-xs font-semibold text-slate-500">
              {room?.name ?? "No room selected"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 transition hover:bg-slate-900 hover:text-white"
          aria-label="Back to profile"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>

      <div className="pulse-scrollbar max-h-64 overflow-y-auto p-3">
        {room ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
                  {room.visibility === "private" ? (
                    <LockKeyhole className="size-4" />
                  ) : (
                    <Hash className="size-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {room.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {room.description || "No room description yet."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  <Radio className="size-3" />
                  Type
                </p>
                <p className="mt-1.5 text-xs font-black capitalize text-white">
                  {room.visibility}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  <UsersRound className="size-3" />
                  Members
                </p>
                <p className="mt-1.5 text-xs font-black text-white">
                  {room.memberCount}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Access
              </p>
              <p className="mt-1.5 text-xs font-bold text-slate-200">
                {room.visibility === "private" ? "Invite only" : "Joinable"}
              </p>
            </div>

            {currentMember ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-black capitalize text-amber-200">
                <Crown className="size-3.5" />
                {currentMember.role}
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-white">Room members</p>
                <span className="text-xs font-bold text-slate-500">
                  {members.length}
                </span>
              </div>

              {shownMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/45 p-2"
                >
                  <InitialAvatar
                    username={member.username}
                    avatarUrl={member.avatarUrl}
                    size="sm"
                    className="size-8 text-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-white">
                      {member.username}
                    </p>
                    <p className="text-[11px] font-semibold capitalize text-slate-500">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-800 bg-slate-900/45 p-3 text-xs leading-5 text-slate-500">
            Select a room to view room settings.
          </p>
        )}
      </div>
    </section>
  );
}

export function RoomSidebar({
  rooms,
  activeRoomId,
  activeRoom,
  members,
  currentUser,
  mode,
  onModeChange,
  isMobileOpen,
  onMobileClose,
}: RoomSidebarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileOpen) {
        onMobileClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen, onMobileClose]);

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rooms;
    }

    return rooms.filter((room) => {
      return [
        room.name,
        room.description ?? "",
        room.latestMessagePreview?.content ?? "",
        room.visibility,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, rooms]);

  const privateRoomCount = rooms.filter(
    (room) => room.visibility === "private",
  ).length;

  const joinedRoomCount = rooms.filter((room) => room.isMember).length;

  const sidebarContent = (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <AppLogo />
        <CreateRoomDialog variant="compact" />
      </div>

      <div className="mb-5">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-500 transition focus-within:border-purple-400/40 focus-within:ring-4 focus-within:ring-purple-500/10">
          <Search className="size-4 shrink-0" />
          <span className="sr-only">Search rooms</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rooms..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-200 outline-none placeholder:text-slate-600"
          />
        </label>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Rooms
          </p>
          <p className="mt-1 text-lg font-black text-white">{rooms.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Joined
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {joinedRoomCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            <LockKeyhole className="size-3" />
            Private
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {privateRoomCount}
          </p>
        </div>
      </div>

      <div className="pulse-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              isActive={room.id === activeRoomId}
              onNavigate={onMobileClose}
            />
          ))
        ) : rooms.length > 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-center">
            <p className="text-sm font-black text-white">No rooms found</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Try a different search or create a new room.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-center">
            <p className="text-sm font-black text-white">No rooms yet</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Create your first public or private room to start organizing chat.
            </p>

            <div className="mt-4 flex justify-center">
              <CreateRoomDialog />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 shrink-0">
        {mode === "settings" ? (
          <SidebarSettingsPanel
            room={activeRoom}
            members={members}
            currentUserId={currentUser.id}
            onClose={() => onModeChange("profile")}
          />
        ) : (
          <ProfileMenu currentUser={currentUser} />
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden min-h-0 w-[340px] shrink-0 flex-col border-r border-slate-800/90 bg-slate-950/82 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:flex">
        {sidebarContent}
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close rooms sidebar"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onMobileClose}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Room list"
            className="relative flex h-full w-[90vw] max-w-sm flex-col border-r border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-black/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                Rooms
              </p>

              <button
                type="button"
                onClick={onMobileClose}
                className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                aria-label="Close rooms"
              >
                <X className="size-4" />
              </button>
            </div>

            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
