"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

type ChatErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ChatError({ error, reset }: ChatErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const supportReference = error.digest ? `Reference: ${error.digest}` : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.16),transparent_34rem)]" />

      <section className="relative w-full max-w-lg rounded-[2rem] border border-slate-800/90 bg-slate-950/75 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl border border-red-400/20 bg-red-500/10 text-red-200 shadow-xl shadow-red-500/10">
          <AlertTriangle className="size-7" />
        </div>

        <h1 className="text-3xl font-black tracking-[-0.04em]">
          Chat could not load.
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-400">
          Something went wrong while loading your workspace. Try again, and if
          it keeps happening, check your Supabase connection and environment
          variables.
        </p>

        {supportReference ? (
          <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-xs font-semibold text-slate-500">
            {supportReference}
          </p>
        ) : null}

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 px-5 text-sm font-black text-white shadow-xl shadow-purple-500/25 transition hover:-translate-y-0.5 hover:shadow-purple-500/35"
        >
          <RefreshCcw className="size-4" />
          Try again
        </button>
      </section>
    </main>
  );
}
