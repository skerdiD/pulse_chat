"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Globe2,
  Loader2,
  LockKeyhole,
  MessageSquarePlus,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { createRoomAction } from "@/server/actions/rooms";
import {
  createRoomSchema,
  type CreateRoomInput,
} from "@/server/validators/chat";

type CreateRoomDialogProps = {
  variant?: "default" | "compact";
};

export function CreateRoomDialog({
  variant = "default",
}: CreateRoomDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<
    z.input<typeof createRoomSchema>,
    unknown,
    CreateRoomInput
  >({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
    },
  });

  const visibility = useWatch({
    control: form.control,
    name: "visibility",
  });

  function closeDialog() {
    if (isPending) {
      return;
    }

    setIsOpen(false);
  }

  function onSubmit(values: CreateRoomInput) {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await createRoomAction(values);

      if (!result.ok) {
        form.setError("root", {
          type: "server",
          message: result.error.message,
        });
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message ?? "Room created.");
      form.reset({
        name: "",
        description: "",
        visibility: "public",
      });
      setIsOpen(false);
      router.push(`/chat?room=${result.data.roomId}`);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          variant === "compact"
            ? "flex size-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-400"
            : "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 px-5 text-sm font-black text-white shadow-xl shadow-purple-500/25 transition hover:-translate-y-0.5 hover:shadow-purple-500/35"
        }
      >
        {variant === "compact" ? (
          <Plus className="size-5" />
        ) : (
          <>
            <MessageSquarePlus className="size-4" />
            Create room
          </>
        )}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-4 sm:items-center sm:py-6">
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-room-title"
            aria-describedby="create-room-description"
            className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-slate-800/90 bg-slate-950 text-white shadow-2xl shadow-black/50 sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />

            <div className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-7 sm:pt-7">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
                  <MessageSquarePlus className="size-5" />
                </div>

                <h2
                  id="create-room-title"
                  className="text-2xl font-black tracking-[-0.04em]"
                >
                  Create a room
                </h2>

                <p
                  id="create-room-description"
                  className="mt-2 text-sm leading-6 text-slate-400"
                >
                  Create a focused space for your team, project, or community.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close create room dialog"
                onClick={closeDialog}
                disabled={isPending}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-slate-700 hover:text-white disabled:pointer-events-none disabled:opacity-60"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7"
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="room-name"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Room name
                  </label>

                  <input
                    id="room-name"
                    type="text"
                    placeholder="Design Team"
                    aria-invalid={Boolean(form.formState.errors.name)}
                    {...form.register("name")}
                    className="h-12 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15"
                  />

                  {form.formState.errors.name?.message ? (
                    <p className="text-sm font-medium text-red-300">
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="room-description"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Description
                  </label>

                  <textarea
                    id="room-description"
                    rows={3}
                    placeholder="Discuss product updates, ideas, and decisions..."
                    aria-invalid={Boolean(form.formState.errors.description)}
                    {...form.register("description")}
                    className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15"
                  />

                  {form.formState.errors.description?.message ? (
                    <p className="text-sm font-medium text-red-300">
                      {form.formState.errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-200">
                    Visibility
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => form.setValue("visibility", "public")}
                      className={
                        visibility === "public"
                          ? "rounded-2xl border border-purple-400/40 bg-purple-500/15 p-4 text-left shadow-lg shadow-purple-500/10"
                          : "rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-left transition hover:border-slate-700"
                      }
                    >
                      <Globe2 className="mb-3 size-5 text-emerald-300" />
                      <p className="text-sm font-black text-white">Public</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Authenticated users can discover and join.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => form.setValue("visibility", "private")}
                      className={
                        visibility === "private"
                          ? "rounded-2xl border border-purple-400/40 bg-purple-500/15 p-4 text-left shadow-lg shadow-purple-500/10"
                          : "rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-left transition hover:border-slate-700"
                      }
                    >
                      <LockKeyhole className="mb-3 size-5 text-purple-300" />
                      <p className="text-sm font-black text-white">Private</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Invite system can be connected later.
                      </p>
                    </button>
                  </div>

                  {form.formState.errors.visibility?.message ? (
                    <p className="text-sm font-medium text-red-300">
                      {form.formState.errors.visibility.message}
                    </p>
                  ) : null}
                </div>

                {form.formState.errors.root?.message ? (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                    {form.formState.errors.root.message}
                  </div>
                ) : null}

                <div className="sticky bottom-0 -mx-5 mt-6 flex border-t border-slate-800/80 bg-slate-950/95 px-5 pt-4 pb-1 backdrop-blur sm:-mx-7 sm:justify-end sm:px-7">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 px-5 text-sm font-black text-white shadow-xl shadow-purple-500/25 transition hover:-translate-y-0.5 hover:shadow-purple-500/35 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-70 sm:w-auto"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <MessageSquarePlus className="size-4" />
                        Create room
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
