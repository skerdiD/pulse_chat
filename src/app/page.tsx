
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Hash,
  LockKeyhole,
  MessageSquareText,
  Radio,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";

import { ChatPreview } from "@/components/chat/ChatPreview";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";

const features = [
  {
    icon: Radio,
    title: "Realtime rooms",
    description:
      "Create focused spaces for teams, creators, projects, and private communities.",
  },
  {
    icon: MessageSquareText,
    title: "Replies and reactions",
    description:
      "Keep conversations clear with message replies, emoji reactions, and clean context.",
  },
  {
    icon: UsersRound,
    title: "Built for groups",
    description:
      "Member counts, room switching, active states, and community-style workflows.",
  },
  {
    icon: LockKeyhole,
    title: "Security-ready foundation",
    description:
      "Designed for Supabase Auth, RLS policies, typed validation, and protected actions.",
  },
  {
    icon: Bell,
    title: "Live collaboration feel",
    description:
      "A product shell ready for live updates, typing states, notifications, and presence.",
  },
  {
    icon: Sparkles,
    title: "Premium SaaS UI",
    description:
      "Dark, polished, responsive, and portfolio-ready instead of tutorial-looking.",
  },
];

const stats = [
  { value: "Rooms", label: "Organized by topic" },
  { value: "Realtime", label: "Live message flow" },
  { value: "Teams", label: "Built for collaboration" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pulse-grid-bg pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-12rem] top-56 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

      <MarketingNavbar />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-10 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-sm font-semibold text-purple-100 shadow-sm">
              <span className="flex size-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              Real-time chat foundation for modern communities
            </div>

            <h1 className="pulse-gradient-text max-w-4xl text-5xl font-black tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Team chat that feels fast, focused, and premium.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Pulse Chat is a real-time room-based chat app for teams, creators,
              and small communities. Create rooms, follow conversations, reply
              with context, and collaborate inside a polished dark workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#preview" className="pulse-primary-button">
                View app preview
                <ArrowRight className="size-4" />
              </Link>
              <Link href="#features" className="pulse-secondary-button">
                Explore features
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="pulse-soft-card rounded-2xl px-4 py-4"
                >
                  <p className="text-sm font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="preview" className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-purple-500/10 blur-2xl" />
            <ChatPreview />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
            <Zap className="size-5" />
          </div>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
            A serious foundation for a real chat product.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
            The base shell is designed to support authentication, rooms,
            messages, reactions, realtime subscriptions, and clean protected
            workflows later.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="pulse-card group rounded-3xl p-6 transition duration-200 hover:-translate-y-1 hover:border-purple-400/30"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/80 text-purple-200 transition group-hover:border-purple-400/40 group-hover:bg-purple-500/10">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-black tracking-[-0.02em] text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="pulse-card overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-slate-300">
                <Hash className="size-4 text-purple-300" />
                Pulse Chat foundation
              </div>
              <h2 className="max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Built to become a complete real-time SaaS chat app.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Start with a clean marketing surface, reusable shells, and a
                premium chat layout. Then connect auth, database actions, rooms,
                and realtime behavior step by step.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="#preview" className="pulse-primary-button">
                Preview shell
                <ArrowRight className="size-4" />
              </Link>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                <CheckCircle2 className="size-4" />
                Ready for auth next
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}