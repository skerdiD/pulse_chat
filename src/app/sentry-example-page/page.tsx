import type { Metadata } from "next";
import Link from "next/link";

import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { SentryExampleActions } from "@/components/sentry/sentry-example-actions";
import { AppLogo } from "@/components/shared/AppLogo";

export const metadata: Metadata = {
  title: "Sentry Verification | Pulse Chat",
  description: "Verify that Pulse Chat is sending Sentry issues correctly.",
};

function StatusCard({
  icon: Icon,
  title,
  description,
  status,
  tone,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  status: string;
  tone: "good" | "warn";
}) {
  const toneClasses =
    tone === "good"
      ? {
          badge:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
          icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
        }
      : {
          badge: "border-amber-400/20 bg-amber-500/10 text-amber-200",
          icon: "border-amber-400/20 bg-amber-500/10 text-amber-200",
        };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/72 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
      <div
        className={`flex size-9 items-center justify-center rounded-xl border ${toneClasses.icon}`}
      >
        <Icon className="size-5" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClasses.badge}`}
        >
          {status}
        </span>
      </div>

      <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function SentryExamplePage() {
  const hasDsn = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
  const hasAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN);

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
            href="/chat"
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
                Observability
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Sentry Verification
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                This page confirms whether Pulse Chat is actually configured to
                send Sentry issues, instead of only having the SDK installed in
                the codebase.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-purple-200">
                    {hasDsn ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <ShieldAlert className="size-5" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {hasDsn
                        ? "Issue delivery is enabled"
                        : "Issue delivery is blocked"}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      {hasDsn
                        ? "NEXT_PUBLIC_SENTRY_DSN is present, so the SDK can send browser and server events."
                        : "NEXT_PUBLIC_SENTRY_DSN is missing in .env.local. Sentry will not send any events until that value is added."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <StatusCard
                icon={Activity}
                title="Browser and server issues"
                description="This is the required DSN-based connection for actual event delivery."
                status={hasDsn ? "Configured" : "Missing DSN"}
                tone={hasDsn ? "good" : "warn"}
              />

              <StatusCard
                icon={KeyRound}
                title="Production source maps"
                description="Recommended for readable production stack traces during uploads in build pipelines."
                status={hasAuthToken ? "Configured" : "Optional auth missing"}
                tone={hasAuthToken ? "good" : "warn"}
              />
            </div>
          </div>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/82 shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className="border-b border-slate-800/90 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl">
                    Run end-to-end issue checks
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Use the test actions below, then open your Sentry project
                    Issues page and confirm the new event appears.
                  </p>
                </div>

                <div className="inline-flex h-fit items-center gap-2 rounded-full border border-purple-400/15 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-purple-200">
                  <Activity className="size-3.5" />
                  Live check
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <SentryExampleActions enabled={hasDsn} />

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs font-medium leading-6 text-slate-500">
                If you only care about proving the integration quickly, the
                client test is enough. Use the server test as an extra check for
                backend error capture.
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
