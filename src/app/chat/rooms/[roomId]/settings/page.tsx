import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  Globe2,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { canEditRoom, getRoomChatHref } from "@/components/chat/room-deletion";
import { RoomSettingsForm } from "@/components/settings/room-settings-form";
import { AppLogo } from "@/components/shared/AppLogo";
import { createClient } from "@/lib/supabase/server";
import { getRoomsForCurrentUser } from "@/server/actions/rooms";

export const metadata: Metadata = {
  title: "Room Settings | Pulse Chat",
  description: "Manage your Pulse Chat room settings.",
};

type RoomSettingsPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function RoomSettingsPage({
  params,
}: RoomSettingsPageProps) {
  const { roomId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const roomsResult = await getRoomsForCurrentUser();

  if (!roomsResult.ok) {
    redirect("/chat");
  }

  const room = roomsResult.data.rooms.find((candidate) => candidate.id === roomId);

  if (!room) {
    notFound();
  }

  if (!canEditRoom(room)) {
    redirect(getRoomChatHref(room.id));
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10rem] top-[-10rem] size-[26rem] rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-10rem] size-[28rem] rounded-full bg-fuchsia-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <AppLogo />

          <Link
            href={getRoomChatHref(room.id)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-4 text-sm font-medium text-slate-300 shadow-xl shadow-black/15 transition hover:border-purple-400/25 hover:bg-slate-900 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to Chat
          </Link>
        </header>

        <section className="grid flex-1 items-start gap-5 py-6 lg:grid-cols-[0.9fr_1.3fr] lg:py-10">
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/74 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/15 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-200">
                <Sparkles className="size-3.5" />
                Room Center
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Room Settings
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Update how this room appears to members. Changes flow back into
                the chat header and sidebar without changing the rest of the
                workspace.
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/45 p-3.5">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/70 text-purple-200">
                  {room.visibility === "private" ? (
                    <LockKeyhole className="size-7" />
                  ) : (
                    <Globe2 className="size-7" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white sm:text-lg">
                    {room.name}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-500">
                    {room.description ?? "No description yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/72 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
                <div className="flex size-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  <ShieldCheck className="size-5" />
                </div>

                <p className="mt-3.5 text-sm font-semibold text-white">
                  Owner-managed
                </p>

                <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                  Only the room owner can update these settings or delete the
                  room.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/72 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
                <div className="flex size-9 items-center justify-center rounded-xl border border-purple-400/15 bg-slate-900 text-purple-200">
                  <Settings2 className="size-5" />
                </div>

                <p className="mt-3.5 text-sm font-semibold text-white">
                  Live room identity
                </p>

                <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                  Room name, description, and visibility are reused across the
                  active chat surfaces.
                </p>
              </div>
            </div>
          </div>

          <RoomSettingsForm room={room} />
        </section>
      </div>
    </main>
  );
}
