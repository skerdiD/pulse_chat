"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import { Menu } from "lucide-react";

import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { ChatRoom } from "@/components/chat/chat-room";
import { RoomSidebar } from "@/components/chat/room-sidebar";
import type {
  ChatMessage,
  ChatRoom as ChatRoomType,
  ChatRoomMember,
  CurrentChatUser,
} from "@/types/chat";

type ChatLayoutProps = {
  rooms: ChatRoomType[];
  activeRoomId: string | null;
  messages: ChatMessage[];
  members: ChatRoomMember[];
  currentUser: CurrentChatUser;
};

const SIDEBAR_STORAGE_KEY = "pulse-chat.sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "pulse-chat:sidebar-collapsed-change";
let sidebarCollapsedFallback = false;

function getStoredSidebarCollapsed() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return sidebarCollapsedFallback;
  }
}

function subscribeToSidebarPreference(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key && event.key !== SIDEBAR_STORAGE_KEY) {
      return;
    }

    onStoreChange();
  }

  function handlePreferenceChange() {
    onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, handlePreferenceChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, handlePreferenceChange);
  };
}

export function ChatLayout({
  rooms,
  activeRoomId,
  messages,
  currentUser,
}: ChatLayoutProps) {
  const [isMobileRoomsOpen, setIsMobileRoomsOpen] = useState(false);
  const isDesktopSidebarCollapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getStoredSidebarCollapsed,
    () => false,
  );

  const openMobileRooms = useCallback(() => {
    setIsMobileRoomsOpen(true);
  }, []);

  const closeMobileRooms = useCallback(() => {
    setIsMobileRoomsOpen(false);
  }, []);

  const setDesktopSidebarCollapsed = useCallback((collapsed: boolean) => {
    sidebarCollapsedFallback = collapsed;

    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
      // Ignore persistence issues and keep the in-memory preference working.
    }

    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  }, []);

  const toggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  }, [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed]);

  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? null;

  return (
    <main className="flex h-dvh min-h-0 overflow-hidden bg-[#050816] text-white">
      <RoomSidebar
        rooms={rooms}
        activeRoomId={activeRoomId}
        isCollapsed={isDesktopSidebarCollapsed}
        isMobileOpen={isMobileRoomsOpen}
        onMobileClose={closeMobileRooms}
        onToggleCollapsed={toggleDesktopSidebar}
      />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {activeRoom ? (
          <ChatRoom
            key={activeRoom.id}
            room={activeRoom}
            messages={messages}
            currentUser={currentUser}
            canSendMessages={activeRoom.isMember}
            onOpenRooms={openMobileRooms}
          />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="absolute left-4 top-4 z-30 lg:hidden">
              <button
                type="button"
                onClick={openMobileRooms}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/90 px-3.5 text-sm font-semibold text-white shadow-xl shadow-black/30 backdrop-blur-xl"
              >
                <Menu className="size-4" />
                Rooms
              </button>
            </div>

            <ChatEmptyState />
          </div>
        )}
      </section>
    </main>
  );
}
