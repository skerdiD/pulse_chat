import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { SentryExampleActions } from "@/components/sentry/sentry-example-actions";

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const metadata: Metadata = {
  title: "Sentry Verification | Pulse Chat",
  description:
    "Verify Pulse Chat's client and server Sentry wiring before enabling production monitoring.",
};

export default function SentryExamplePage() {
  const isSentryConfigured = Boolean(sentryDsn);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#020617_100%)] px-6 py-16 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            <CheckCircle2 className="size-3.5" />
            Observability
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Sentry Verification
            </h1>
            <p className="text-base leading-7 text-slate-300 sm:text-lg">
              Use this page to validate Pulse Chat&apos;s client and server
              monitoring hooks before shipping changes to production.
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
            <SentryExampleActions enabled={isSentryConfigured} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Status
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {isSentryConfigured ? "Configured" : "Setup required"}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {isSentryConfigured
                  ? "A public DSN is available, so both verification actions are enabled."
                  : "NEXT_PUBLIC_SENTRY_DSN is missing in .env.local, so the verification actions stay disabled in CI and local development."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-amber-400/20 bg-amber-500/10 p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-200">
                  <AlertTriangle className="size-4.5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-amber-100">
                    Verification checklist
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-100/75">
                    Add <code>NEXT_PUBLIC_SENTRY_DSN</code> to{" "}
                    <code>.env.local</code>, restart the app, then run the
                    client and server checks from this page.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
