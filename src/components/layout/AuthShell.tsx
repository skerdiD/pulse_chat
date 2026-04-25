import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Hash, MessageSquareText, Radio, Shield } from "lucide-react";

import { AppLogo } from "@/components/shared/AppLogo";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
  children: ReactNode;
};

const highlights = [
  {
    icon: Radio,
    title: "Realtime-ready",
    description: "Built for live rooms, message updates, and collaboration.",
  },
  {
    icon: Shield,
    title: "Auth-first",
    description: "Prepared for protected routes and secure user sessions.",
  },
  {
    icon: MessageSquareText,
    title: "Premium chat UX",
    description: "Clean room-based interface with modern dark SaaS styling.",
  },
];

export function AuthShell({
  badge,
  title,
  description,
  footerText,
  footerHref,
  footerLinkText,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_34rem),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_34rem)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.88fr] lg:gap-12">
          <section className="hidden lg:flex lg:flex-col lg:justify-between">
            <Link href="/" aria-label="Go to Pulse Chat home">
              <AppLogo />
            </Link>

            <div className="mt-16 max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-sm font-bold text-purple-100">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
                {badge}
              </div>

              <h1 className="bg-gradient-to-br from-white via-purple-100 to-sky-200 bg-clip-text text-5xl font-black tracking-[-0.06em] text-transparent xl:text-6xl">
                Secure access to your realtime workspace.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Pulse Chat is designed as a premium room-based chat app for
                teams, creators, and small communities.
              </p>

              <div className="mt-10 space-y-4">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
                    >
                      <div className="flex gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
                          <Icon className="size-5" />
                        </div>

                        <div>
                          <h2 className="font-black tracking-[-0.02em] text-white">
                            {item.title}
                          </h2>
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <CheckCircle2 className="size-4 text-emerald-400" />
              Auth foundation ready for protected chat routes
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-8 flex justify-center lg:hidden">
                <Link href="/" aria-label="Go to Pulse Chat home">
                  <AppLogo />
                </Link>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-purple-500/10 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />

                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200 shadow-xl shadow-purple-500/10">
                      <Hash className="size-6" />
                    </div>

                    <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
                      {title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </div>

                  {children}

                  <p className="mt-8 text-center text-sm font-medium text-slate-400">
                    {footerText}{" "}
                    <Link
                      href={footerHref}
                      className="font-black text-purple-300 transition hover:text-purple-200"
                    >
                      {footerLinkText}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}