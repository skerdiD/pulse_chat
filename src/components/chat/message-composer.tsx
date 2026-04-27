"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CornerUpLeft, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { ReplyPreview } from "@/components/chat/reply-preview";
import { sendMessageAction } from "@/server/actions/messages";
import {
  sendMessageSchema,
  type SendMessageInput,
} from "@/server/validators/chat";
import type { ChatMessageReplyPreview } from "@/types/chat";

type MessageComposerProps = {
  roomId: string;
  replyToMessage: ChatMessageReplyPreview | null;
  onCancelReply: () => void;
  onMessageSent: () => void;
  onTyping?: () => void;
};

export function MessageComposer({
  roomId,
  replyToMessage,
  onCancelReply,
  onMessageSent,
  onTyping,
}: MessageComposerProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastTypingSentAtRef = useRef(0);
  const [isPending, startTransition] = useTransition();

  const form = useForm<
    z.input<typeof sendMessageSchema>,
    unknown,
    SendMessageInput
  >({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      roomId,
      content: "",
      replyToMessageId: undefined,
    },
    mode: "onSubmit",
  });

  const content = useWatch({
    control: form.control,
    name: "content",
  });
  const contentField = form.register("content");

  useEffect(() => {
    form.setValue("roomId", roomId);
  }, [form, roomId]);

  useEffect(() => {
    form.setValue("replyToMessageId", replyToMessage?.id ?? undefined);

    if (replyToMessage) {
      textareaRef.current?.focus();
    }
  }, [form, replyToMessage]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [content]);

  function emitTyping(value: string) {
    if (!value.trim()) {
      return;
    }

    const now = Date.now();

    if (now - lastTypingSentAtRef.current < 1200) {
      return;
    }

    lastTypingSentAtRef.current = now;
    onTyping?.();
  }

  function onSubmit(values: SendMessageInput) {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await sendMessageAction({
        roomId,
        content: values.content,
        replyToMessageId: replyToMessage?.id,
      });

      if (!result.ok) {
        form.setError("root", {
          type: "server",
          message: result.error.message,
        });
        toast.error(result.error.message);
        return;
      }

      lastTypingSentAtRef.current = 0;

      form.reset({
        roomId,
        content: "",
        replyToMessageId: undefined,
      });

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      onMessageSent();
      router.refresh();
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }

    if (event.key === "Escape" && replyToMessage) {
      onCancelReply();
    }
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(onSubmit)(event);
  }

  return (
    <div className="shrink-0 border-t border-slate-800/90 bg-slate-950/72 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-4">
      <div className="mx-auto w-full max-w-5xl">
        {replyToMessage ? (
          <div className="mb-3 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-3 shadow-lg shadow-purple-500/5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-purple-200">
                <CornerUpLeft className="size-3.5" />
                Replying
              </div>

              <button
                type="button"
                onClick={onCancelReply}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-900 hover:text-white"
                aria-label="Cancel reply"
              >
                <X className="size-4" />
              </button>
            </div>

            <ReplyPreview
              authorName={replyToMessage.authorUsername}
              content={replyToMessage.content}
              compact
            />
          </div>
        ) : null}

        <form onSubmit={handleFormSubmit}>
          <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 shadow-2xl shadow-black/20 transition focus-within:border-purple-400/40 focus-within:ring-4 focus-within:ring-purple-500/10">
            <div className="flex items-end gap-2 p-2">
              <textarea
                ref={(node) => {
                  contentField.ref(node);
                  textareaRef.current = node;
                }}
                name={contentField.name}
                onBlur={contentField.onBlur}
                onChange={(event) => {
                  contentField.onChange(event);
                  emitTyping(event.target.value);
                }}
                rows={1}
                placeholder="Type a message..."
                aria-invalid={Boolean(form.formState.errors.content)}
                onKeyDown={handleKeyDown}
                className="pulse-scrollbar max-h-40 min-h-11 flex-1 resize-none rounded-2xl bg-transparent px-3 py-3 text-sm font-medium leading-6 text-white outline-none placeholder:text-slate-600 focus-visible:outline-none"
              />

              <button
                type="submit"
                disabled={isPending || !content?.trim()}
                className="mb-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-400 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Send message"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>

            {form.formState.errors.content?.message ? (
              <p className="border-t border-slate-800 px-4 py-2 text-sm font-medium text-red-300">
                {form.formState.errors.content.message}
              </p>
            ) : null}

            {form.formState.errors.root?.message ? (
              <p className="border-t border-slate-800 px-4 py-2 text-sm font-medium text-red-300">
                {form.formState.errors.root.message}
              </p>
            ) : null}
          </div>

          <p className="mt-2 px-2 text-xs font-medium text-slate-600">
            Press Enter to send, Shift + Enter for a new line. Press Escape to
            cancel a reply.
          </p>
        </form>
      </div>
    </div>
  );
}
