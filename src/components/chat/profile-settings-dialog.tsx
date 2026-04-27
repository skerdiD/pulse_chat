"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UserRound, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { getSafeAvatarUrl } from "@/lib/avatar";
import { updateProfileAction } from "@/server/actions/profile";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/server/validators/profile";
import type { CurrentChatUser } from "@/types/chat";

type ProfileSettingsDialogProps = {
  currentUser: CurrentChatUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

function getInitials(username: string) {
  return username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileSettingsDialog({
  currentUser,
  isOpen,
  onOpenChange,
}: ProfileSettingsDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<
    z.input<typeof updateProfileSchema>,
    unknown,
    UpdateProfileInput
  >({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: currentUser.username,
      avatarUrl: currentUser.avatarUrl ?? "",
    },
  });

  const avatarUrl = useWatch({
    control: form.control,
    name: "avatarUrl",
  });
  const username = useWatch({
    control: form.control,
    name: "username",
  });
  const previewAvatarUrl = getSafeAvatarUrl(avatarUrl);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl ?? "",
      });
    }
  }, [currentUser.avatarUrl, currentUser.username, form, isOpen]);

  function closeDialog() {
    if (!isPending) {
      onOpenChange(false);
    }
  }

  function onSubmit(values: UpdateProfileInput) {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await updateProfileAction(values);

      if (!result.ok) {
        form.setError("root", {
          type: "server",
          message: result.error.message,
        });
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message ?? "Profile updated.");
      onOpenChange(false);
      router.refresh();
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close profile settings"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeDialog}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-title"
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-800/90 bg-slate-950 p-6 text-white shadow-2xl shadow-black/50 sm:p-7"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
              <UserRound className="size-5" />
            </div>

            <h2
              id="profile-settings-title"
              className="text-2xl font-black tracking-[-0.04em]"
            >
              Profile settings
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Update how your profile appears inside rooms and messages.
            </p>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 transition hover:text-white"
            aria-label="Close profile settings"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-purple-400 via-purple-500 to-fuchsia-600 text-lg font-black text-white shadow-lg shadow-purple-500/20">
              {previewAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewAvatarUrl}
                  alt={`${username || currentUser.username} avatar preview`}
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                getInitials(username || currentUser.username)
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-black text-white">
                {username || currentUser.username}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="profile-username"
              className="text-sm font-semibold text-slate-200"
            >
              Username
            </label>

            <input
              id="profile-username"
              type="text"
              autoComplete="username"
              placeholder="Your username"
              aria-invalid={Boolean(form.formState.errors.username)}
              {...form.register("username")}
              className="h-12 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15"
            />

            {form.formState.errors.username?.message ? (
              <p className="text-sm font-medium text-red-300">
                {form.formState.errors.username.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="profile-avatar"
              className="text-sm font-semibold text-slate-200"
            >
              Avatar URL optional
            </label>

            <input
              id="profile-avatar"
              type="url"
              placeholder="https://example.com/avatar.png"
              aria-invalid={Boolean(form.formState.errors.avatarUrl)}
              {...form.register("avatarUrl")}
              className="h-12 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15"
            />

            {form.formState.errors.avatarUrl?.message ? (
              <p className="text-sm font-medium text-red-300">
                {form.formState.errors.avatarUrl.message}
              </p>
            ) : null}
          </div>

          {form.formState.errors.root?.message ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
              {form.formState.errors.root.message}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 px-5 text-sm font-bold text-slate-300 transition hover:text-white disabled:pointer-events-none disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 px-5 text-sm font-black text-white shadow-xl shadow-purple-500/25 transition hover:-translate-y-0.5 hover:shadow-purple-500/35 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save profile
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
