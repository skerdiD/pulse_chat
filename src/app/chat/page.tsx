import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatLayout } from "@/components/chat/chat-layout";
import { createClient } from "@/lib/supabase/server";
import { getRoomsForCurrentUser } from "@/server/actions/rooms";
import { syncProfileForUser } from "@/server/actions/auth";

export const metadata: Metadata = {
  title: "Chat | Pulse Chat",
  description: "Manage your Pulse Chat rooms.",
};

type ChatPageProps = {
  searchParams: Promise<{
    room?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await syncProfileForUser(user);

  const roomsResult = await getRoomsForCurrentUser();

  if (!roomsResult.ok) {
    redirect("/login");
  }

  const rooms = roomsResult.data.rooms;
  const requestedRoomId = params.room;

  const activeRoom =
    rooms.find((room) => room.id === requestedRoomId) ??
    rooms.find((room) => room.isMember) ??
    rooms[0] ??
    null;

  const username =
    typeof user.user_metadata?.username === "string" &&
    user.user_metadata.username.trim().length > 0
      ? user.user_metadata.username
      : user.email?.split("@")[0] ?? "Pulse User";

  return (
    <ChatLayout
      rooms={rooms}
      activeRoomId={activeRoom?.id ?? null}
      currentUser={{
        id: user.id,
        email: user.email ?? "",
        username,
      }}
    />
  );
}