"use client";

import { useState } from "react";

import * as Sentry from "@sentry/nextjs";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  ServerCrash,
} from "lucide-react";
import { toast } from "sonner";

type SentryExampleActionsProps = {
  enabled: boolean;
};

export function SentryExampleActions({
  enabled,
}: SentryExampleActionsProps) {
  const [isServerPending, setIsServerPending] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  function handleClientIssue() {
    if (!enabled) {
      toast.error("Set NEXT_PUBLIC_SENTRY_DSN before sending a test issue.");
      return;
    }

    const eventId = Sentry.captureException(
      new Error(
        `[Sentry Test] Pulse Chat client verification ${new Date().toISOString()}`,
      ),
      {
        tags: {
          source: "sentry-example-page",
          runtime: "client",
        },
      },
    );

    setLastEventId(eventId);
    toast.success("Client test issue sent to Sentry.");
  }

  async function handleServerIssue() {
    if (!enabled) {
      toast.error("Set NEXT_PUBLIC_SENTRY_DSN before triggering a server issue.");
      return;
    }

    setIsServerPending(true);

    try {
      const response = await fetch("/api/sentry-example-api", {
        method: "POST",
        cache: "no-store",
      });

      if (response.ok) {
        toast.success("Server test request completed.");
        return;
      }

      toast.message("Server test error triggered. Check Sentry Issues.");
    } catch {
      toast.message("Server test request sent. Check Sentry Issues.");
    } finally {
      setIsServerPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!enabled}
          onClick={handleClientIssue}
          className="flex min-h-32 flex-col items-start justify-between rounded-[1.5rem] border border-slate-800 bg-slate-950/75 p-5 text-left shadow-xl shadow-black/15 transition hover:border-purple-400/25 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex size-11 items-center justify-center rounded-2xl border border-purple-400/15 bg-slate-900 text-purple-200">
            <Send className="size-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Send client test issue</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Uses <code>Sentry.captureException</code> from the browser so you
              can verify ingestion without crashing the page.
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={!enabled || isServerPending}
          onClick={handleServerIssue}
          className="flex min-h-32 flex-col items-start justify-between rounded-[1.5rem] border border-slate-800 bg-slate-950/75 p-5 text-left shadow-xl shadow-black/15 transition hover:border-emerald-400/20 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            {isServerPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ServerCrash className="size-5" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Trigger server test error
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Calls a dedicated Next.js route that throws on the server so you
              can verify backend issue capture too.
            </p>
          </div>
        </button>
      </div>

      {lastEventId ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
              <CheckCircle2 className="size-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Last client event queued
              </p>
              <p className="mt-1 break-all text-xs font-medium text-slate-500">
                Event ID: {lastEventId}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4 text-xs font-medium leading-5 text-slate-500">
          A successful client test will show the event id here so you can match
          it against the issue details in Sentry.
        </div>
      )}

      {!enabled ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-200">
              <AlertTriangle className="size-4.5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-100">
                Sentry is currently disabled
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-amber-100/75">
                Add <code>NEXT_PUBLIC_SENTRY_DSN</code> to <code>.env.local</code>
                and restart the dev server before using this page.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
