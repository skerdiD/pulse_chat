import { Crown, ShieldCheck, UserRound } from "lucide-react";

import { getSafeAvatarUrl } from "@/lib/avatar";
import type { ChatRoomMember } from "@/types/chat";

type MemberListProps = {
  members: ChatRoomMember[];
  currentUserId: string;
};

function getInitials(username: string) {
  return username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-black text-amber-200">
        <Crown className="size-3" />
        Owner
      </span>
    );
  }

  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-xs font-black text-purple-200">
        <ShieldCheck className="size-3" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-black text-slate-400">
      <UserRound className="size-3" />
      Member
    </span>
  );
}

export function MemberList({ members, currentUserId }: MemberListProps) {
  const sortedMembers = [...members].sort((a, b) => {
    const roleRank = {
      owner: 0,
      admin: 1,
      member: 2,
    };

    if (roleRank[a.role] !== roleRank[b.role]) {
      return roleRank[a.role] - roleRank[b.role];
    }

    return a.username.localeCompare(b.username);
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black tracking-[-0.03em] text-white">
            Members
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            People who can access this room.
          </p>
        </div>

        <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-400">
          {members.length}
        </span>
      </div>

      {sortedMembers.length > 0 ? (
        <div className="space-y-2">
          {sortedMembers.map((member) => {
            const memberAvatarUrl = getSafeAvatarUrl(member.avatarUrl);

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/45 p-3"
              >
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 via-purple-500 to-fuchsia-600 text-xs font-black text-white shadow-lg shadow-purple-500/20">
                  {memberAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={memberAvatarUrl}
                      alt={`${member.username} avatar`}
                      className="size-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    getInitials(member.username)
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black text-white">
                      {member.username}
                    </p>

                    {member.userId === currentUserId ? (
                      <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-black text-purple-200">
                        You
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Joined {formatJoinedDate(member.joinedAt)}
                  </p>
                </div>

                <RoleBadge role={member.role} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 text-center">
          <p className="text-sm font-black text-white">No members loaded</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Members will appear here when the room data is available.
          </p>
        </div>
      )}
    </section>
  );
}
