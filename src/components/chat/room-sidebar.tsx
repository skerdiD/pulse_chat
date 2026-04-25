"use client";

import { useMemo, useState } from "react";
import { Menu, Search, X } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { CreateRoomDialog } from "@/components/chat/create-room-dialog";
import { RoomItem } from "@/components/chat/room-item";
import { AppLogo } from "@/components/shared/AppLogo";
import type { ChatRoom, CurrentChatUser } from "@/types/chat";

type RoomSidebarProps = {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  currentUser: CurrentChatUser;
};

export function RoomSidebar({
  rooms,
  activeRoomId,
  currentUser,
}: RoomSidebarProps) {
  const [query, setQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, rooms]);

  const sidebarContent = (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <AppLogo />

        <CreateRoomDialog variant="compact" />
      </div>

      <div className="mb-5">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-500">
          <Search className="size-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rooms..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-200 outline-none placeholder:text-slate-600"
          />
        </label>
      </div>

      <div className="pulse-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              isActive={room.id === activeRoomId}
              onNavigate={() => setIsMobileOpen(false)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-center">
            <p className="text-sm font-black text-white">No rooms found</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Try a different search or create a new room.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <p className="truncate text-sm font-black text-white">
          {currentUser.username}
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
          {currentUser.email}
        </p>

        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed left-4 top-4 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/90 px-4 text-sm font-black text-white shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <Menu className="size-4" />
          Rooms
        </button>
      </div>

      <aside className="hidden w-[340px] shrink-0 flex-col border-r border-slate-800/90 bg-slate-950/80 p-4 lg:flex">
        {sidebarContent}
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close rooms sidebar"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />

          <aside className="relative flex h-full w-[88vw] max-w-sm flex-col border-r border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-black/50">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 transition hover:text-white"
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