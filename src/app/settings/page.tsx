import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, ShieldCheck, Sparkles, UserRound } from "lucide-react";

import { InitialAvatar } from "@/components/chat/initial-avatar";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { AppLogo } from "@/components/shared/AppLogo";
import { createClient } from "@/lib/supabase/server";
import { syncProfileForUser } from "@/server/actions/auth";
import { getCurrentUserProfile } from "@/server/actions/profile";

export const metadata: Metadata = {
  title: "Settings | Pulse Chat",
  description: "Manage your Pulse Chat profile and preferences.",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await syncProfileForUser(user);
  } catch {
    redirect("/login");
  }

  const profileResult = await getCurrentUserProfile();

  if (!profileResult.ok) {
    redirect("/login");
  }

  const currentUser = profileResult.data.profile;

  return (
    <main className="min-h-dvh overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10rem] top-[-10rem] size-[26rem] rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-10rem] size-[28rem] rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <AppLogo />

          <Link
            href="/chat"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm font-black text-slate-300 shadow-2xl shadow-black/20 transition hover:border-purple-400/30 hover:bg-slate-900 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to Chat
          </Link>
        </header>

        <section className="grid flex-1 items-start gap-6 py-8 lg:grid-cols-[0.9fr_1.3fr] lg:py-12">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/72 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-purple-200">
                <Sparkles className="size-3.5" />
                Account Center
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                Settings
              </h1>

              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-400 sm:text-base">
                Manage your profile and preferences. These details are used
                across rooms, messages, member lists, and realtime activity.
              </p>

              <div className="mt-6 flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/45 p-4">
                <InitialAvatar
                  username={currentUser.username}
                  avatarUrl={currentUser.avatarUrl}
                  size="lg"
                  showStatus
                  className="size-16 text-xl"
                />

                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-white">
                    {currentUser.username}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/72 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  <ShieldCheck className="size-5" />
                </div>

                <p className="mt-4 text-sm font-black text-white">
                  Protected account
                </p>

                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                  Settings are loaded through your authenticated server session.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/72 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
                  <UserRound className="size-5" />
                </div>

                <p className="mt-4 text-sm font-black text-white">
                  Profile identity
                </p>

                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                  Your username and avatar appear inside realtime chat surfaces.
                </p>
              </div>
            </div>
          </div>

          <ProfileSettingsForm currentUser={currentUser} />
        </section>
      </div>
    </main>
  );
}