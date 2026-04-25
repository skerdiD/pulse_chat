"use client";

import { useState } from "react";
import {
  Crown,
  Hash,
  LockKeyhole,
  Radio,
  Settings,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";

import { MemberList } from "@/components/chat/member-list";
import type { ChatRoom, ChatRoomMember } from "@/types/chat";

type RoomSettingsDialogProps = {
  room: ChatRoom;
  members: ChatRoomMember[];
  currentUserId: string;
};

export function RoomSettingsDialog({
  room,
  members,
  currentUserId,
}: RoomSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentMember = members.find((member) => member.userId === currentUserId);
  const isOwner = currentMember?.role === "owner";
  const isAdmin = currentMember?.role === "admin";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-purple-400/30 hover:text-white"
        aria-label="Open room settings"
      >
        <Settings className="size-4" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Close room settings"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-settings-title"
            className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-slate-800/90 bg-slate-950 text-white shadow-2xl shadow-black/50"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />

            <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-6">
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
                  {room.visibility === "private" ? (
                    <LockKeyhole className="size-5" />
                  ) : (
                    <Hash className="size-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <h2
                    id="room-settings-title"
                    className="truncate text-2xl font-black tracking-[-0.04em]"
                  >
                    {room.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {room.description || "No room description yet."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-black capitalize text-slate-300">
                      {room.visibility === "private" ? (
                        <LockKeyhole className="size-3.5 text-purple-300" />
                      ) : (
                        <Radio className="size-3.5 text-emerald-300" />
                      )}
                      {room.visibility}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-300">
                      <UsersRound className="size-3.5" />
                      {room.memberCount}{" "}
                      {room.memberCount === 1 ? "member" : "members"}
                    </span>

                    {isOwner ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-200">
                        <Crown className="size-3.5" />
                        Owner
                      </span>
                    ) : null}

                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-black text-purple-200">
                        <ShieldCheck className="size-3.5" />
                        Admin
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 transition hover:text-white"
                aria-label="Close room settings"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="pulse-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Room type
                  </p>
                  <p className="mt-2 text-sm font-black capitalize text-white">
                    {room.visibility}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Members
                  </p>
                  <p className="mt-2 text-sm font-black text-white">
                    {room.memberCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Access
                  </p>
                  <p className="mt-2 text-sm font-black text-white">
                    {room.visibility === "private" ? "Invite only" : "Joinable"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <MemberList members={members} currentUserId={currentUserId} />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}