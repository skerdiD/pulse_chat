"use client";

import { useRouter } from "next/navigation";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { InitialAvatar } from "@/components/chat/initial-avatar";
import { MessageActions } from "@/components/chat/message-actions";
import { ReactionBadge } from "@/components/chat/reaction-badge";
import { ReplyPreview } from "@/components/chat/reply-preview";
import { formatMessageTime } from "@/lib/format";
import { updateMessageAction } from "@/server/actions/messages";
import type { ChatMessage } from "@/types/chat";

type MessageItemProps = {
  message: ChatMessage;
  currentUserId: string;
  isOwnMessage: boolean;
  onReply: () => void;
  onMessageUpdated: (
    messageId: string,
    updates: Pick<ChatMessage, "content" | "isEdited" | "updatedAt">,
  ) => void;
  onMessageDeleted: (messageId: string) => void;
};

export const MessageItem = memo(function MessageItem({
  message,
  isOwnMessage,
  onReply,
  onMessageUpdated,
  onMessageDeleted,
}: MessageItemProps) {
  const router = useRouter();
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isPending, startTransition] = useTransition();
  const reactions = useMemo(
    () =>
      [...message.reactions].sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.emoji.localeCompare(b.emoji);
      }),
    [message.reactions],
  );
  const isTransientMessage = Boolean(message.sendStatus);
  const isSending = message.sendStatus === "sending";
  const isFailed = message.sendStatus === "failed";

  useEffect(() => {
    if (!isEditing) {
      setEditContent(message.content);
    }
  }, [isEditing, message.content]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = editTextareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [isEditing]);

  function startEditing() {
    setEditContent(message.content);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditContent(message.content);
  }

  function saveEdit() {
    const nextContent = editContent.trim();

    if (!nextContent) {
      toast.error("Message cannot be empty.");
      return;
    }

    if (nextContent === message.content) {
      cancelEditing();
      return;
    }

    startTransition(async () => {
      const result = await updateMessageAction({
        messageId: message.id,
        content: nextContent,
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      onMessageUpdated(result.data.messageId, {
        content: result.data.content,
        isEdited: result.data.isEdited,
        updatedAt: result.data.updatedAt,
      });
      setIsEditing(false);
      toast.success(result.message ?? "Message edited.");
      router.refresh();
    });
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    }

    if (event.key === "Escape") {
      cancelEditing();
    }
  }

  function handleEditChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditContent(event.target.value);

    event.currentTarget.style.height = "auto";
    event.currentTarget.style.height = `${Math.min(
      event.currentTarget.scrollHeight,
      180,
    )}px`;
  }

  return (
    <article className="group relative rounded-3xl px-2 py-3 transition duration-150 hover:bg-slate-900/45 sm:px-3">
      <div
        className={
          isSending
            ? "flex gap-3 opacity-75"
            : isFailed
              ? "flex gap-3 opacity-85"
              : "flex gap-3"
        }
      >
        <InitialAvatar
          username={message.author.username}
          avatarUrl={message.author.avatarUrl}
          size="md"
          showStatus
          className="mt-0.5 size-10 sm:size-11"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-black tracking-[-0.01em] text-white">
              {message.author.username}
            </h3>

            <time
              dateTime={message.createdAt}
              className="text-xs font-semibold text-slate-500"
            >
              {formatMessageTime(message.createdAt)}
            </time>

            {message.isEdited ? (
              <span className="text-xs font-semibold text-slate-600">
                edited
              </span>
            ) : null}

            {isSending ? (
              <span className="text-xs font-semibold text-slate-500">
                sending
              </span>
            ) : null}

            {isFailed ? (
              <span className="text-xs font-semibold text-red-300">
                failed
              </span>
            ) : null}

            {isOwnMessage ? (
              <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-black text-purple-200">
                You
              </span>
            ) : null}
          </div>

          {message.replyToMessage ? (
            <div className="mt-2 max-w-2xl">
              <ReplyPreview
                authorName={message.replyToMessage.authorUsername}
                content={message.replyToMessage.content}
                compact
              />
            </div>
          ) : null}

          {isEditing ? (
            <div className="mt-2 max-w-3xl rounded-2xl border border-purple-400/30 bg-slate-950 p-2 shadow-xl shadow-black/20">
              <textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={handleEditChange}
                onKeyDown={handleEditKeyDown}
                rows={1}
                disabled={isPending}
                aria-label="Edit message"
                className="pulse-scrollbar max-h-44 min-h-20 w-full resize-none bg-transparent px-2 py-2 text-sm font-medium leading-6 text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
              />

              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-800 px-3 text-xs font-black text-slate-300 transition hover:border-slate-700 hover:text-white disabled:pointer-events-none disabled:opacity-60"
                >
                  <X className="size-3.5" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isPending || !editContent.trim()}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-purple-500 px-3 text-xs font-black text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-400 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">
              {message.content}
            </p>
          )}

          {reactions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {reactions.map((reaction) => (
                <ReactionBadge
                  key={reaction.emoji}
                  messageId={message.id}
                  reaction={reaction}
                />
              ))}
            </div>
          ) : null}
        </div>

        {!isTransientMessage ? (
          <MessageActions
            messageId={message.id}
            messageContent={message.content}
            canModify={isOwnMessage}
            onReply={onReply}
            onEdit={startEditing}
            onDeleted={onMessageDeleted}
            variant="desktop"
          />
        ) : null}
      </div>

      {!isTransientMessage ? (
        <MessageActions
          messageId={message.id}
          messageContent={message.content}
          canModify={isOwnMessage}
          onReply={onReply}
          onEdit={startEditing}
          onDeleted={onMessageDeleted}
          variant="mobile"
        />
      ) : null}
    </article>
  );
}, areMessageItemPropsEqual);

function areMessageItemPropsEqual(
  previous: MessageItemProps,
  next: MessageItemProps,
) {
  return (
    previous.message === next.message &&
    previous.currentUserId === next.currentUserId &&
    previous.isOwnMessage === next.isOwnMessage
  );
}
