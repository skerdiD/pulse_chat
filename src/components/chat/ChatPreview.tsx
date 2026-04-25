// src/components/chat/ChatPreview.tsx
import {
  Hash,
  MoreVertical,
  Search,
  Send,
  Settings,
  Smile,
  UsersRound,
} from "lucide-react";

const rooms = [
  {
    name: "General",
    members: "12 members",
    message: "Hey everyone!",
    active: true,
  },
  {
    name: "Design Team",
    members: "5 members",
    message: "New mockups are ready",
    active: false,
  },
  {
    name: "Development",
    members: "8 members",
    message: "Deployed to staging",
    active: false,
  },
];

const messages = [
  {
    name: "Sarah Johnson",
    time: "10:30 AM",
    avatar: "from-fuchsia-400 to-purple-500",
    message: "Hey everyone! Welcome to the chat room 👋",
    reactions: [
      ["👍", "5"],
      ["👋", "3"],
    ],
  },
  {
    name: "Mike Chen",
    time: "10:31 AM",
    avatar: "from-sky-400 to-cyan-500",
    message: "Thanks for having me here!",
    reactions: [],
  },
  {
    name: "Emily Rodriguez",
    time: "10:32 AM",
    avatar: "from-emerald-400 to-sky-500",
    reply: "Replying to Sarah Johnson",
    message: "Excited to collaborate with everyone",
    reactions: [["🎉", "2"]],
  },
];

export function ChatPreview() {
  return (
    <div className="pulse-card relative overflow-hidden rounded-[2rem]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />

      <div className="grid min-h-[520px] lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-800/90 bg-slate-950/45 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-[-0.03em] text-white">
              Chat Rooms
            </h3>
            <button className="flex size-9 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-400">
              +
            </button>
          </div>

          <label className="mb-5 flex h-11 items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-950/70 px-3 text-sm text-slate-500">
            <Search className="size-4" />
            <span>Search rooms...</span>
          </label>

          <div className="space-y-2">
            {rooms.map((room) => (
              <div
                key={room.name}
                className={
                  room.active
                    ? "rounded-2xl border border-purple-400/40 bg-purple-500/20 p-3 shadow-lg shadow-purple-500/10"
                    : "rounded-2xl border border-transparent p-3 transition hover:border-slate-700/70 hover:bg-slate-900/60"
                }
              >
                <div className="flex gap-3">
                  <div
                    className={
                      room.active
                        ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white"
                        : "flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200"
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
                      {room.message}
                    </p>
                  </div>
                </div>

                {room.active ? (
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Active now
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col bg-slate-950/25">
          <header className="flex h-16 items-center justify-between border-b border-slate-800/90 px-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-500 text-white">
                <Hash className="size-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">General</h4>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <UsersRound className="size-3" />
                  <span>12 members</span>
                </div>
              </div>
            </div>

            <button className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-900 hover:text-white">
              <Settings className="size-4" />
            </button>
          </header>

          <div className="pulse-scrollbar flex-1 space-y-6 overflow-y-auto px-5 py-6">
            {messages.map((message) => (
              <div key={`${message.name}-${message.time}`} className="group">
                <div className="flex gap-3">
                  <div
                    className={`size-11 shrink-0 rounded-full bg-gradient-to-br ${message.avatar}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-white">
                        {message.name}
                      </p>
                      <span className="text-xs font-medium text-slate-500">
                        {message.time}
                      </span>
                    </div>

                    {message.reply ? (
                      <div className="mb-3 border-l border-slate-600 py-1 pl-3">
                        <p className="text-xs font-semibold text-slate-400">
                          {message.reply}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Hey everyone! Welcome to the chat room 👋
                        </p>
                      </div>
                    ) : null}

                    <p className="text-sm leading-6 text-slate-100">
                      {message.message}
                    </p>

                    {message.reactions.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.reactions.map(([emoji, count]) => (
                          <button
                            key={`${emoji}-${count}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 text-xs font-bold text-slate-300 transition hover:border-purple-400/40 hover:bg-purple-500/10"
                          >
                            <span>{emoji}</span>
                            <span>{count}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="hidden items-center gap-1 rounded-xl border border-slate-700/70 bg-slate-900/80 p-1 opacity-0 shadow-xl transition group-hover:opacity-100 sm:flex">
                    <button className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
                      <Smile className="size-4" />
                    </button>
                    <button className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/90 p-4">
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-800/80 px-4 shadow-inner">
              <span className="flex-1 text-sm font-medium text-slate-500">
                Type a message...
              </span>
              <button className="text-slate-400 transition hover:text-white">
                <Smile className="size-5" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-400">
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}