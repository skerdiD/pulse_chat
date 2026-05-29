"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Crown,
  Loader2,
  LogOut,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { InitialAvatar } from "@/components/chat/initial-avatar";
import { canManageRoomMembers } from "@/components/chat/room-deletion";
import {
  addRoomMemberAction,
  leaveRoomAction,
  removeRoomMemberAction,
} from "@/server/actions/rooms";
import type { ChatRoom, ChatRoomMember } from "@/types/chat";

type RoomMembersPanelProps = {
  room: ChatRoom;
  members: ChatRoomMember[];
  currentUserId: string;
};

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function RoleBadge({ role }: { role: ChatRoomMember["role"] }) {
  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
        <Crown className="size-3" />
        Owner
      </span>
    );
  }

  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-200">
        <ShieldCheck className="size-3" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-400">
      <UserRound className="size-3" />
      Member
    </span>
  );
}

export function RoomMembersPanel({
  room,
  members,
  currentUserId,
}: RoomMembersPanelProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canManageMembers = canManageRoomMembers(room);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const roleRank = {
          owner: 0,
          admin: 1,
          member: 2,
        };

        if (roleRank[a.role] !== roleRank[b.role]) {
          return roleRank[a.role] - roleRank[b.role];
        }

        return a.username.localeCompare(b.username);
      }),
    [members],
  );

  function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextUsername = username.trim();

    if (!nextUsername) {
      return;
    }

    startTransition(async () => {
      const result = await addRoomMemberAction({
        roomId: room.id,
        username: nextUsername,
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      setUsername("");
      toast.success(result.message ?? "Member added.");
      router.refresh();
    });
  }

  function handleRemoveMember(member: ChatRoomMember) {
    setPendingUserId(member.userId);

    startTransition(async () => {
      const result = await removeRoomMemberAction({
        roomId: room.id,
        userId: member.userId,
      });

      setPendingUserId(null);

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message ?? "Member removed.");
      router.refresh();
    });
  }

  function handleLeaveRoom() {
    setPendingUserId(currentUserId);

    startTransition(async () => {
      const result = await leaveRoomAction(room.id);

      setPendingUserId(null);

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message ?? "Left room.");
      router.replace("/chat");
      router.refresh();
    });
  }

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/82 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="border-b border-slate-800/90 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em] text-white">
              Members
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {members.length} {members.length === 1 ? "person" : "people"}
            </p>
          </div>

          {canManageMembers ? (
            <form
              onSubmit={handleAddMember}
              className="flex w-full gap-2 sm:w-auto"
            >
              <label className="sr-only" htmlFor="room-member-username">
                Username
              </label>
              <input
                id="room-member-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isPending}
                placeholder="Username"
                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-52"
              />
              <button
                type="submit"
                disabled={isPending || username.trim().length === 0}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-500 px-3 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && !pendingUserId ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                Add
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 p-5 sm:p-6">
        {sortedMembers.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const canRemoveMember =
            canManageMembers && !isCurrentUser && member.role !== "owner";
          const canLeave = isCurrentUser && member.role !== "owner";
          const isMemberPending = pendingUserId === member.userId;

          return (
            <div
              key={member.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/45 p-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <InitialAvatar
                  username={member.username}
                  avatarUrl={member.avatarUrl}
                  size="md"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {member.username}
                    </p>

                    {isCurrentUser ? (
                      <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-200">
                        You
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Joined {formatJoinedDate(member.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <RoleBadge role={member.role} />

                {canRemoveMember ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRemoveMember(member)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isMemberPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Remove
                  </button>
                ) : null}

                {canLeave ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleLeaveRoom}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isMemberPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <LogOut className="size-3.5" />
                    )}
                    Leave
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
