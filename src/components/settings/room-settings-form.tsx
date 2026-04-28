"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Globe2, Loader2, LockKeyhole, Save, Settings2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateRoomAction } from "@/server/actions/rooms";
import {
  updateRoomSchema,
  type UpdateRoomInput,
} from "@/server/validators/chat";
import type { ChatRoom } from "@/types/chat";

type RoomSettingsFormProps = {
  room: ChatRoom;
};

export function RoomSettingsForm({ room }: RoomSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<
    z.input<typeof updateRoomSchema>,
    unknown,
    UpdateRoomInput
  >({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      roomId: room.id,
      name: room.name,
      description: room.description ?? "",
      visibility: room.visibility,
    },
  });

  const name = useWatch({
    control: form.control,
    name: "name",
  });

  const description = useWatch({
    control: form.control,
    name: "description",
  });

  const visibility = useWatch({
    control: form.control,
    name: "visibility",
  });

  useEffect(() => {
    form.reset({
      roomId: room.id,
      name: room.name,
      description: room.description ?? "",
      visibility: room.visibility,
    });
  }, [form, room.description, room.id, room.name, room.visibility]);

  function onSubmit(values: UpdateRoomInput) {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await updateRoomAction(values);

      if (!result.ok) {
        form.setError("root", {
          type: "server",
          message: result.error.message,
        });
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message ?? "Room updated.");
      router.replace(`/chat?room=${room.id}`);
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
            <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/70 text-purple-200">
              {visibility === "private" ? (
                <LockKeyhole className="size-7" />
              ) : (
                <Globe2 className="size-7" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl">
                {name?.trim() || room.name}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-slate-500">
                {description?.trim() || "No description yet"}
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-400/15 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-purple-200">
            <Settings2 className="size-3.5" />
            Room
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <input type="hidden" {...form.register("roomId")} />

        <div>
          <label
            htmlFor="room-name"
            className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Room name
          </label>

          <input
            id="room-name"
            type="text"
            disabled={isPending}
            {...form.register("name")}
            className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Room name"
          />

          {form.formState.errors.name?.message ? (
            <p className="mt-2 text-sm font-semibold text-red-300">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="room-description"
            className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Description
          </label>

          <textarea
            id="room-description"
            rows={4}
            disabled={isPending}
            {...form.register("description")}
            className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Describe what this room is for"
          />

          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
            Optional. Give members a quick sense of the room&apos;s purpose.
          </p>

          {form.formState.errors.description?.message ? (
            <p className="mt-2 text-sm font-semibold text-red-300">
              {form.formState.errors.description.message}
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Visibility
          </p>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => form.setValue("visibility", "public")}
              className={
                visibility === "public"
                  ? "rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left ring-1 ring-purple-400/25"
                  : "rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-left transition hover:border-slate-700"
              }
            >
              <Globe2 className="mb-3 size-5 text-emerald-300" />
              <p className="text-sm font-semibold text-white">Public</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Authenticated users can discover and join this room.
              </p>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => form.setValue("visibility", "private")}
              className={
                visibility === "private"
                  ? "rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left ring-1 ring-purple-400/25"
                  : "rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-left transition hover:border-slate-700"
              }
            >
              <LockKeyhole className="mb-3 size-5 text-purple-300" />
              <p className="text-sm font-semibold text-white">Private</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Only existing members can access this room.
              </p>
            </button>
          </div>

          {form.formState.errors.visibility?.message ? (
            <p className="mt-2 text-sm font-semibold text-red-300">
              {form.formState.errors.visibility.message}
            </p>
          ) : null}
        </div>

        {form.formState.errors.root?.message ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            {form.formState.errors.root.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium leading-5 text-slate-500">
            Changes will update how this room appears in the sidebar and chat
            header.
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
                Save room
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
