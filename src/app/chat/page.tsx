import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatLayout } from "@/components/chat/chat-layout";
import { createClient } from "@/lib/supabase/server";
import { syncProfileForUser } from "@/server/actions/auth";
import { getMessagesForRoom } from "@/server/actions/messages";
import { getCurrentUserProfile } from "@/server/actions/profile";
import {
  getRoomMembersForCurrentUserRoom,
  getRoomsForCurrentUser,
} from "@/server/actions/rooms";
import type { ChatMessagePageInfo } from "@/types/chat";

export const metadata: Metadata = {
  title: "Chat | Pulse Chat",
  description: "Manage your Pulse Chat rooms and messages.",
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

  const [roomsResult, profileResult] = await Promise.all([
    getRoomsForCurrentUser(),
    getCurrentUserProfile(),
  ]);

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

  const [messagesResult, membersResult] =
    activeRoom && activeRoom.isMember
      ? await Promise.all([
          getMessagesForRoom(activeRoom.id),
          getRoomMembersForCurrentUserRoom(activeRoom.id),
        ])
      : [null, null];

  const messages = messagesResult?.ok ? messagesResult.data.messages : [];
  const messagePageInfo: ChatMessagePageInfo = messagesResult?.ok
    ? messagesResult.data.pageInfo
    : {
        hasMore: false,
        nextCursor: null,
      };
  const members = membersResult?.ok ? membersResult.data.members : [];

  const fallbackUsername =
    typeof user.user_metadata?.username === "string" &&
    user.user_metadata.username.trim().length > 0
      ? user.user_metadata.username
      : user.email?.split("@")[0] ?? "Pulse User";

  const profile = profileResult.ok ? profileResult.data.profile : null;

  return (
    <ChatLayout
      rooms={rooms}
      activeRoomId={activeRoom?.id ?? null}
      messages={messages}
      messagePageInfo={messagePageInfo}
      members={members}
      currentUser={{
        id: user.id,
        email: user.email ?? "",
        username: profile?.username ?? fallbackUsername,
        avatarUrl: profile?.avatarUrl ?? null,
      }}
    />
  );
}
