"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { InitialAvatar } from "@/components/chat/initial-avatar";
import { updateProfileAction } from "@/server/actions/profile";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/server/validators/profile";
import type { CurrentChatUser } from "@/types/chat";

type ProfileSettingsFormProps = {
  currentUser: CurrentChatUser;
};

export function ProfileSettingsForm({ currentUser }: ProfileSettingsFormProps) {
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

  useEffect(() => {
    form.reset({
      username: currentUser.username,
      avatarUrl: currentUser.avatarUrl ?? "",
    });
  }, [currentUser.avatarUrl, currentUser.username, form]);

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
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/82 shadow-2xl shadow-black/25 backdrop-blur-xl"
    >
      <div className="border-b border-slate-800/90 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <InitialAvatar
              username={username || currentUser.username}
              avatarUrl={avatarUrl || currentUser.avatarUrl}
              size="lg"
              className="size-16 text-xl"
            />

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl">
                {username || currentUser.username}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-slate-500">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-400/15 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-purple-200">
            <UserRound className="size-3.5" />
            Profile
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <label
            htmlFor="username"
            className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            disabled={isPending}
            {...form.register("username")}
            className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Your username"
          />

          {form.formState.errors.username?.message ? (
            <p className="mt-2 text-sm font-semibold text-red-300">
              {form.formState.errors.username.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="avatarUrl"
            className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Avatar URL
          </label>

          <input
            id="avatarUrl"
            type="url"
            disabled={isPending}
            {...form.register("avatarUrl")}
            className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="https://example.com/avatar.png"
          />

          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
            Optional. Use a safe http:// or https:// image URL.
          </p>

          {form.formState.errors.avatarUrl?.message ? (
            <p className="mt-2 text-sm font-semibold text-red-300">
              {form.formState.errors.avatarUrl.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={currentUser.email}
            readOnly
            className="mt-2 h-11 w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900/45 px-4 text-sm font-medium text-slate-400 outline-none"
          />

          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
            Email is managed by your authentication provider.
          </p>
        </div>

        {form.formState.errors.root?.message ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            {form.formState.errors.root.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium leading-5 text-slate-500">
            Changes will update how your profile appears in rooms and messages.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </form>
  );
}
