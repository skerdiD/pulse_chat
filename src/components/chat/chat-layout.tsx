"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { useRouter } from "next/navigation";

import { Menu } from "lucide-react";

import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import {
  getNextRoomIdAfterDeletion,
} from "@/components/chat/room-deletion";
import { ChatRoom } from "@/components/chat/chat-room";
import { RoomSidebar } from "@/components/chat/room-sidebar";
import type {
  ChatMessage,
  ChatMessagePageInfo,
  ChatRoom as ChatRoomType,
  ChatRoomMember,
  CurrentChatUser,
} from "@/types/chat";

type ChatLayoutProps = {
  rooms: ChatRoomType[];
  activeRoomId: string | null;
  messages: ChatMessage[];
  messagePageInfo: ChatMessagePageInfo;
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
  messagePageInfo,
  currentUser,
}: ChatLayoutProps) {
  const router = useRouter();
  const [isMobileRoomsOpen, setIsMobileRoomsOpen] = useState(false);
  const [deletedRoomIds, setDeletedRoomIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hiddenActiveRoomId, setHiddenActiveRoomId] = useState<string | null>(
    null,
  );
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

  const roomList = useMemo(
    () => rooms.filter((room) => !deletedRoomIds.has(room.id)),
    [deletedRoomIds, rooms],
  );
  const currentActiveRoomId =
    activeRoomId === hiddenActiveRoomId ? null : activeRoomId;

  const handleRoomDeleted = useCallback(
    (deletedRoomId: string) => {
      setDeletedRoomIds((currentIds) => {
        if (currentIds.has(deletedRoomId)) {
          return currentIds;
        }

        const nextIds = new Set(currentIds);
        nextIds.add(deletedRoomId);
        return nextIds;
      });
      closeMobileRooms();

      if (activeRoomId !== deletedRoomId) {
        void router.refresh();
        return;
      }

      setHiddenActiveRoomId(deletedRoomId);

      const nextRoomId = getNextRoomIdAfterDeletion(roomList, deletedRoomId);

      if (nextRoomId) {
        router.replace(`/chat?room=${nextRoomId}`);
      } else {
        router.replace("/chat");
      }
    },
    [activeRoomId, closeMobileRooms, roomList, router],
  );

  const activeRoom =
    roomList.find((room) => room.id === currentActiveRoomId) ?? null;

  return (
    <main className="flex h-dvh min-h-0 overflow-hidden bg-[#050816] text-white">
      <RoomSidebar
        rooms={roomList}
        activeRoomId={currentActiveRoomId}
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
            messagePageInfo={messagePageInfo}
            currentUser={currentUser}
            canSendMessages={activeRoom.isMember}
            onOpenRooms={openMobileRooms}
            onRoomDeleted={handleRoomDeleted}
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
