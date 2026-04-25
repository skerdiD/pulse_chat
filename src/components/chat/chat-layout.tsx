import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { ChatRoom } from "@/components/chat/chat-room";
import { RoomSidebar } from "@/components/chat/room-sidebar";
import type { ChatMessage, ChatRoom as ChatRoomType, CurrentChatUser } from "@/types/chat";

type ChatLayoutProps = {
  rooms: ChatRoomType[];
  activeRoomId: string | null;
  messages: ChatMessage[];
  currentUser: CurrentChatUser;
};

export function ChatLayout({
  rooms,
  activeRoomId,
  messages,
  currentUser,
}: ChatLayoutProps) {
  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? null;

  return (
    <main className="flex min-h-screen overflow-hidden bg-[#050816] text-white">
      <RoomSidebar
        rooms={rooms}
        activeRoomId={activeRoomId}
        currentUser={currentUser}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        {activeRoom ? (
          <ChatRoom
            room={activeRoom}
            messages={messages}
            currentUser={currentUser}
            canSendMessages={activeRoom.isMember}
          />
        ) : (
          <ChatEmptyState />
        )}
      </section>
    </main>
  );
}