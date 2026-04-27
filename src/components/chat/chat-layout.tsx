"use client";

import { useState } from "react";
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

export function ChatLayout({
  rooms,
  activeRoomId,
  messages,
  members,
  currentUser,
}: ChatLayoutProps) {
  const [isMobileRoomsOpen, setIsMobileRoomsOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"profile" | "settings">(
    "profile",
  );
  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? null;

  function openRoomSettings() {
    setSidebarMode("settings");
    setIsMobileRoomsOpen(true);
  }

  return (
    <main className="flex h-dvh min-h-0 overflow-hidden bg-[#050816] text-white">
      <RoomSidebar
        rooms={rooms}
        activeRoomId={activeRoomId}
        activeRoom={activeRoom}
        members={members}
        currentUser={currentUser}
        mode={sidebarMode}
        onModeChange={setSidebarMode}
        isMobileOpen={isMobileRoomsOpen}
        onMobileOpen={() => setIsMobileRoomsOpen(true)}
        onMobileClose={() => setIsMobileRoomsOpen(false)}
      />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {activeRoom ? (
          <ChatRoom
            key={activeRoom.id}
            room={activeRoom}
            messages={messages}
            currentUser={currentUser}
            canSendMessages={activeRoom.isMember}
            onOpenRooms={() => setIsMobileRoomsOpen(true)}
            onOpenRoomSettings={openRoomSettings}
          />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="absolute left-4 top-4 z-30 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileRoomsOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/90 px-4 text-sm font-black text-white shadow-2xl shadow-black/40 backdrop-blur-xl"
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
