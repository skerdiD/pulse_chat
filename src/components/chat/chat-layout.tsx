import {
  Hash,
  LockKeyhole,
  MessageSquareText,
  Radio,
  Settings,
  UsersRound,
} from "lucide-react";

import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { RoomSidebar } from "@/components/chat/room-sidebar";
import type { ChatRoom, CurrentChatUser } from "@/types/chat";

type ChatLayoutProps = {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  currentUser: CurrentChatUser;
};

export function ChatLayout({
  rooms,
  activeRoomId,
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
          <>
            <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-950/60 px-4 backdrop-blur-xl sm:px-6 lg:h-[76px]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                  {activeRoom.visibility === "private" ? (
                    <LockKeyhole className="size-5" />
                  ) : (
                    <Hash className="size-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <h1 className="truncate text-lg font-black tracking-[-0.03em] text-white sm:text-xl">
                      {activeRoom.name}
                    </h1>

                    <span className="hidden rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold capitalize text-slate-400 sm:inline-flex">
                      {activeRoom.visibility}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <UsersRound className="size-3.5" />
                      {activeRoom.memberCount}{" "}
                      {activeRoom.memberCount === 1 ? "member" : "members"}
                    </span>

                    {activeRoom.description ? (
                      <span className="hidden max-w-xl truncate md:inline">
                        {activeRoom.description}
                      </span>
                    ) : (
                      <span className="hidden md:inline">
                        No description yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-purple-400/30 hover:text-white"
                aria-label="Room settings"
              >
                <Settings className="size-4" />
              </button>
            </header>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_34rem)]" />

              <div className="relative w-full max-w-2xl rounded-[2rem] border border-slate-800/90 bg-slate-950/70 p-6 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl border border-purple-400/20 bg-purple-500/10 text-purple-200 shadow-xl shadow-purple-500/10">
                  <MessageSquareText className="size-7" />
                </div>

                <h2 className="text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                  Room shell is ready.
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  You are viewing{" "}
                  <span className="font-bold text-slate-200">
                    {activeRoom.name}
                  </span>
                  . Messages, replies, reactions, and Supabase Realtime will be
                  connected next.
                </p>

                <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Visibility
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-black capitalize text-white">
                      {activeRoom.visibility === "private" ? (
                        <LockKeyhole className="size-4 text-purple-300" />
                      ) : (
                        <Radio className="size-4 text-emerald-300" />
                      )}
                      {activeRoom.visibility}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Members
                    </p>
                    <p className="mt-2 text-sm font-black text-white">
                      {activeRoom.memberCount}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-black text-emerald-300">
                      Room ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ChatEmptyState />
        )}
      </section>
    </main>
  );
}