import { Hash, MessageSquareText, Plus, Search, Settings, UsersRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { AppLogo } from "@/components/shared/AppLogo";

type ChatShellProps = {
  user: {
    email: string;
    username: string;
  };
};

const rooms = [
  {
    name: "General",
    members: "12 members",
    latest: "Welcome to Pulse Chat",
    active: true,
  },
  {
    name: "Design Team",
    members: "5 members",
    latest: "New mockups are ready",
    active: false,
  },
  {
    name: "Development",
    members: "8 members",
    latest: "Realtime setup comes next",
    active: false,
  },
  {
    name: "Product Ideas",
    members: "15 members",
    latest: "Plan the next feature",
    active: false,
  },
];

export function ChatShell({ user }: ChatShellProps) {
  return (
    <main className="flex min-h-screen bg-[#050816] text-white">
      <aside className="hidden w-[320px] shrink-0 border-r border-slate-800/90 bg-slate-950/80 p-4 lg:flex lg:flex-col">
        <div className="mb-6 flex items-center justify-between">
          <AppLogo />

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-400"
            aria-label="Create room"
          >
            <Plus className="size-5" />
          </button>
        </div>

        <label className="mb-5 flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-500">
          <Search className="size-4" />
          <span>Search rooms...</span>
        </label>

        <div className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.name}
              type="button"
              className={
                room.active
                  ? "w-full rounded-2xl border border-purple-400/40 bg-purple-500/20 p-3 text-left shadow-lg shadow-purple-500/10"
                  : "w-full rounded-2xl border border-transparent p-3 text-left transition hover:border-slate-700/80 hover:bg-slate-900/70"
              }
            >
              <div className="flex gap-3">
                <div
                  className={
                    room.active
                      ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white"
                      : "flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300"
                  }
                >
                  <Hash className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">
                    {room.name}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <UsersRound className="size-3" />
                    <span>{room.members}</span>
                  </div>

                  <p className="mt-2 truncate text-xs font-semibold text-slate-500">
                    {room.latest}
                  </p>
                </div>
              </div>

              {room.active ? (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Protected route active
                </div>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-sm font-black text-white">{user.username}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {user.email}
          </p>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-950/60 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-500 text-white">
              <Hash className="size-5" />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-[-0.03em] text-white">
                General
              </h1>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <UsersRound className="size-3" />
                <span>12 members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-purple-400/30 hover:text-white"
              aria-label="Room settings"
            >
              <Settings className="size-4" />
            </button>

            <LogoutButton />
          </div>
        </header>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_34rem)]" />

          <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-800/90 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl border border-purple-400/20 bg-purple-500/10 text-purple-200 shadow-xl shadow-purple-500/10">
              <MessageSquareText className="size-7" />
            </div>

            <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
              Authentication is working.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              This is the protected Pulse Chat route. Chat features are not
              built yet. The next step is rooms, messages, replies, reactions,
              and Supabase Realtime.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Signed in as
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {user.username}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}