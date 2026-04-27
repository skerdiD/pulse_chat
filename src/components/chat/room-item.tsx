"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Globe2,
  Hash,
  Loader2,
  LockKeyhole,
  LogIn,
  MessageSquareText,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { joinRoomAction } from "@/server/actions/rooms";
import type { ChatRoom } from "@/types/chat";

type RoomItemProps = {
  room: ChatRoom;
  isActive: boolean;
  onNavigate?: () => void;
};

export function RoomItem({ room, isActive, onNavigate }: RoomItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function joinRoom() {
    startTransition(async () => {
      const result = await joinRoomAction({
        roomId: room.id,
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message ?? "Joined room.");
      router.push(`/chat?room=${room.id}`);
      router.refresh();
      onNavigate?.();
    });
  }

  const latestTime = room.latestMessagePreview?.timeLabel ?? "";

  const content = (
    <div
      className={
        isActive
          ? "w-full rounded-xl border border-slate-700/80 bg-slate-900/85 p-2.5 text-left shadow-lg shadow-black/20 ring-1 ring-inset ring-purple-400/20"
          : "w-full rounded-xl border border-transparent p-2.5 text-left transition hover:border-slate-700/80 hover:bg-slate-900/65"
      }
    >
      <div className="flex gap-2.5">
        <div
          className={
            isActive
              ? "flex size-10 shrink-0 items-center justify-center rounded-lg border border-purple-400/20 bg-slate-800 text-purple-100 shadow-sm shadow-black/20"
              : "flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-300"
          }
        >
          {room.visibility === "private" ? (
            <LockKeyhole className="size-4" />
          ) : (
            <Hash className="size-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-medium text-white">
              {room.name}
            </p>

            {room.visibility === "private" ? (
              <LockKeyhole className="size-3 shrink-0 text-purple-300" />
            ) : (
              <Globe2 className="size-3 shrink-0 text-emerald-300" />
            )}

            {latestTime ? (
              <span className="ml-auto shrink-0 text-[11px] font-medium text-slate-500">
                {latestTime}
              </span>
            ) : null}
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <UsersRound className="size-3" />
            <span>
              {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
            </span>
          </div>

          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] font-normal text-slate-500 sm:text-xs">
            <MessageSquareText className="size-3 shrink-0" />
            <p className="truncate">
              {room.latestMessagePreview?.content ?? "No messages yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        {room.isMember ? (
          <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]" />
            {room.currentUserRole === "owner"
              ? "Owner"
              : room.currentUserRole === "admin"
                ? "Admin"
              : "Joined"}
          </div>
        ) : room.visibility === "public" ? (
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span className="size-1.5 rounded-full bg-slate-500" />
            Public room
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <LockKeyhole className="size-3" />
            Invite only
          </div>
        )}

        {!room.isMember && room.visibility === "public" ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              joinRoom();
            }}
            disabled={isPending}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-purple-400/20 bg-slate-900 px-2.5 text-[11px] font-semibold text-purple-100 transition hover:border-purple-400/35 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-70"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LogIn className="size-3.5" />
            )}
            Join
          </button>
        ) : null}
      </div>
    </div>
  );

  if (!room.isMember) {
    return <div>{content}</div>;
  }

  return (
    <Link
      href={`/chat?room=${room.id}`}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </Link>
  );
}
