"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LockKeyhole, Search, Settings, X } from "lucide-react";

import { CreateRoomDialog } from "@/components/chat/create-room-dialog";
import { RoomItem } from "@/components/chat/room-item";
import { AppLogo } from "@/components/shared/AppLogo";
import type { ChatRoom } from "@/types/chat";

type RoomSidebarProps = {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  isMobileOpen: boolean;
  onMobileClose: () => void;
};

function SettingsLauncher({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/settings"
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl shadow-black/25 transition hover:border-purple-400/30 hover:bg-slate-900/80 focus:outline-none focus:ring-4 focus:ring-purple-500/15"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200 shadow-lg shadow-purple-500/10 transition group-hover:border-purple-300/40 group-hover:bg-purple-500/15 group-hover:text-white">
        <Settings className="size-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-white">Settings</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
          Profile, account, preferences
        </span>
      </span>

      <span className="text-lg font-black text-slate-600 transition group-hover:text-purple-200">
        →
      </span>
    </Link>
  );
}

export function RoomSidebar({
  rooms,
  activeRoomId,
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
        <SettingsLauncher onNavigate={onMobileClose} />
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