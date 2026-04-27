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
  currentUser,
}: ChatLayoutProps) {
  const [isMobileRoomsOpen, setIsMobileRoomsOpen] = useState(false);

  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? null;

  return (
    <main className="flex h-dvh min-h-0 overflow-hidden bg-[#050816] text-white">
      <RoomSidebar
        rooms={rooms}
        activeRoomId={activeRoomId}
        isMobileOpen={isMobileRoomsOpen}
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
          />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="absolute left-4 top-4 z-30 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileRoomsOpen(true)}
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
