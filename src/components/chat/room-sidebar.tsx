"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  LockKeyhole,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  X,
} from "lucide-react";

import { CreateRoomDialog } from "@/components/chat/create-room-dialog";
import { RoomItem } from "@/components/chat/room-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppLogo } from "@/components/shared/AppLogo";
import { cn } from "@/lib/utils";
import type { ChatRoom } from "@/types/chat";

type RoomSidebarProps = {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onToggleCollapsed: () => void;
};

function SidebarTooltip({
  content,
  disabled = false,
  children,
}: {
  content: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function SettingsLauncher({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href="/settings"
      onClick={onNavigate}
      aria-label="Open settings"
      className={cn(
        "group rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl shadow-black/20 transition hover:bg-slate-900/80 focus:outline-none focus:ring-4 focus:ring-purple-500/10",
        collapsed
          ? "flex size-14 items-center justify-center p-0 hover:border-slate-700"
          : "flex items-center gap-3 p-2.5 hover:border-purple-400/25",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-purple-200 shadow-md shadow-black/15 transition group-hover:border-purple-300/30 group-hover:text-white">
        <Settings className="size-[1.125rem]" />
      </span>

      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-white">
              Settings
            </span>
            <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">
              Profile, account, preferences
            </span>
          </span>

          <ArrowRight className="size-4 shrink-0 text-slate-600 transition group-hover:text-purple-200" />
        </>
      ) : (
        <span className="sr-only">Settings</span>
      )}
    </Link>
  );

  return (
    <SidebarTooltip
      content="Settings"
      disabled={!collapsed}
    >
      {link}
    </SidebarTooltip>
  );
}

export function RoomSidebar({
  rooms,
  activeRoomId,
  isCollapsed,
  isMobileOpen,
  onMobileClose,
  onToggleCollapsed,
}: RoomSidebarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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

  const roomList = (
    collapsed: boolean,
    onNavigate?: () => void,
  ) => (
    <div
      className={cn(
        "pulse-scrollbar min-h-0 flex-1 overflow-y-auto",
        collapsed ? "space-y-2" : "space-y-1.5 pr-1",
      )}
    >
      {filteredRooms.length > 0 ? (
        filteredRooms.map((room) => (
          <RoomItem
            key={room.id}
            room={room}
            isActive={room.id === activeRoomId}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))
      ) : rooms.length > 0 ? (
        collapsed ? (
          <div className="flex justify-center pt-2">
            <SidebarTooltip
              content="No rooms match the current search."
            >
              <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/90 text-slate-500">
                <Search className="size-4" />
                <span className="sr-only">No rooms found</span>
              </div>
            </SidebarTooltip>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-center">
            <p className="text-sm font-semibold text-white">No rooms found</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Try a different search or create a new room.
            </p>
          </div>
        )
      ) : collapsed ? (
        <div className="flex justify-center pt-2">
          <SidebarTooltip content="No rooms yet. Create one to get started.">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/90 text-slate-500">
              <LockKeyhole className="size-4" />
              <span className="sr-only">No rooms yet</span>
            </div>
          </SidebarTooltip>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-center">
          <p className="text-sm font-semibold text-white">No rooms yet</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Create your first public or private room to start organizing chat.
          </p>

          <div className="mt-4 flex justify-center">
            <CreateRoomDialog />
          </div>
        </div>
      )}
    </div>
  );

  const desktopSidebarContent = (
    <>
      <div
        className={cn(
          "mb-5 flex",
          isCollapsed
            ? "flex-col items-center gap-3"
            : "items-center justify-between gap-3",
        )}
      >
        <SidebarTooltip content="Pulse Chat" disabled={!isCollapsed}>
          <div>
            <AppLogo compact={isCollapsed} />
          </div>
        </SidebarTooltip>

        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed && "flex-col",
          )}
        >
          <SidebarTooltip content="Create room" disabled={!isCollapsed}>
            <div>
              <CreateRoomDialog variant="compact" />
            </div>
          </SidebarTooltip>

          <SidebarTooltip
            content={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            disabled={!isCollapsed}
          >
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-controls="chat-room-sidebar"
              aria-expanded={!isCollapsed}
              aria-label={
                isCollapsed ? "Expand rooms sidebar" : "Collapse rooms sidebar"
              }
              className="flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/90 text-slate-300 shadow-md shadow-black/20 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>
          </SidebarTooltip>
        </div>
      </div>

      {isCollapsed ? null : (
        <>
          <div className="mb-4">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/90 px-3 text-sm text-slate-500 transition focus-within:border-purple-400/35 focus-within:ring-4 focus-within:ring-purple-500/10">
              <Search className="size-4 shrink-0" />
              <span className="sr-only">Search rooms</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rooms"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-200 outline-none placeholder:text-slate-600"
              />
            </label>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Rooms
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                {rooms.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Joined
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                {joinedRoomCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <LockKeyhole className="size-3" />
                Private
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                {privateRoomCount}
              </p>
            </div>
          </div>
        </>
      )}

      {roomList(isCollapsed)}

      <div className="mt-3 shrink-0">
        <SettingsLauncher collapsed={isCollapsed} />
      </div>
    </>
  );

  const mobileSidebarContent = (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <AppLogo />
        <CreateRoomDialog variant="compact" />
      </div>

      <div className="mb-4">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/90 px-3 text-sm text-slate-500 transition focus-within:border-purple-400/35 focus-within:ring-4 focus-within:ring-purple-500/10">
          <Search className="size-4 shrink-0" />
          <span className="sr-only">Search rooms</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rooms"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-200 outline-none placeholder:text-slate-600"
          />
        </label>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Rooms
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {rooms.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Joined
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {joinedRoomCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            <LockKeyhole className="size-3" />
            Private
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {privateRoomCount}
          </p>
        </div>
      </div>

      {roomList(false, onMobileClose)}

      <div className="mt-3 shrink-0">
        <SettingsLauncher onNavigate={onMobileClose} />
      </div>
    </>
  );

  return (
    <>
      <TooltipProvider>
        <aside
          id="chat-room-sidebar"
          className={cn(
            "hidden min-h-0 shrink-0 flex-col border-r border-slate-800/90 bg-slate-950/84 shadow-2xl shadow-black/20 backdrop-blur-xl transition-[width,padding] duration-200 lg:flex",
            isCollapsed ? "w-20 p-3" : "w-[320px] p-3.5 xl:w-[332px]",
          )}
        >
          {desktopSidebarContent}
        </aside>
      </TooltipProvider>

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
            className="relative flex h-full w-[90vw] max-w-[20rem] flex-col border-r border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-black/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Rooms
              </p>

              <button
                type="button"
                onClick={onMobileClose}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                aria-label="Close rooms"
              >
                <X className="size-4" />
              </button>
            </div>

            {mobileSidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
