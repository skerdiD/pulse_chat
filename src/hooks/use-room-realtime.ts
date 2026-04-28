"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { getSafeAvatarUrl } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";
import type {
  ChatMessage,
  ChatMessageReactionSummary,
  ChatMessageReplyPreview,
  CurrentChatUser,
  RealtimeConnectionStatus,
  TypingUser,
} from "@/types/chat";

type UseRoomRealtimeParams = {
  roomId: string;
  initialMessages: ChatMessage[];
  currentUser: CurrentChatUser;
  enabled: boolean;
};

type MessageRow = {
  id: string;
  room_id: string;
  user_id: string;
  reply_to_message_id: string | null;
  content: string;
  is_edited: boolean | null;
  created_at: string;
  updated_at: string;
};

type ReactionRow = {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type TypingPayload = {
  roomId: string;
  userId: string;
  username: string;
  at: string;
};

type SavedMessageResult = {
  messageId: string;
  content: string;
  replyToMessageId: string | null;
  createdAt: string;
  updatedAt: string;
};

function sortMessagesByCreatedAt(messages: ChatMessage[]) {
  return [...messages].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
}

function createTemporaryMessageId() {
  const randomId =
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

  return `temp-${Date.now()}-${randomId}`;
}

function isOptimisticMessage(message: ChatMessage) {
  return (
    message.id.startsWith("temp-") ||
    Boolean(message.clientMessageId) ||
    Boolean(message.sendStatus)
  );
}

function getOptimisticMatchScore(
  optimisticMessage: ChatMessage,
  savedMessage: ChatMessage,
) {
  if (!isOptimisticMessage(optimisticMessage)) {
    return null;
  }

  if (
    optimisticMessage.roomId !== savedMessage.roomId ||
    optimisticMessage.userId !== savedMessage.userId ||
    optimisticMessage.content !== savedMessage.content ||
    optimisticMessage.replyToMessageId !== savedMessage.replyToMessageId
  ) {
    return null;
  }

  const diff = Math.abs(
    Date.parse(optimisticMessage.createdAt) - Date.parse(savedMessage.createdAt),
  );

  return diff <= 60_000 ? diff : null;
}

function sortReactionSummaries(
  reactions: ChatMessageReactionSummary[],
): ChatMessageReactionSummary[] {
  return [...reactions].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.emoji.localeCompare(b.emoji);
  });
}

function areReactionSummariesEqual(
  current: ChatMessageReactionSummary[],
  next: ChatMessageReactionSummary[],
) {
  if (current.length !== next.length) {
    return false;
  }

  return current.every((reaction, index) => {
    const nextReaction = next[index];

    return (
      reaction.emoji === nextReaction.emoji &&
      reaction.count === nextReaction.count &&
      reaction.reactedByCurrentUser === nextReaction.reactedByCurrentUser
    );
  });
}

function areReplyPreviewsEqual(
  current: ChatMessageReplyPreview | null,
  next: ChatMessageReplyPreview | null,
) {
  if (current === next) {
    return true;
  }

  if (!current || !next) {
    return false;
  }

  return (
    current.id === next.id &&
    current.content === next.content &&
    current.authorUsername === next.authorUsername &&
    current.createdAt === next.createdAt
  );
}

function areMessagesEqual(current: ChatMessage, next: ChatMessage) {
  return (
    current.id === next.id &&
    current.clientMessageId === next.clientMessageId &&
    current.roomId === next.roomId &&
    current.userId === next.userId &&
    current.replyToMessageId === next.replyToMessageId &&
    current.content === next.content &&
    current.isEdited === next.isEdited &&
    current.createdAt === next.createdAt &&
    current.updatedAt === next.updatedAt &&
    current.author.id === next.author.id &&
    current.author.username === next.author.username &&
    current.author.avatarUrl === next.author.avatarUrl &&
    current.sendStatus === next.sendStatus &&
    areReplyPreviewsEqual(current.replyToMessage, next.replyToMessage) &&
    areReactionSummariesEqual(current.reactions, next.reactions)
  );
}

function mergeRealtimeMessages(
  realtimeMessages: ChatMessage[],
  serverMessages: ChatMessage[],
  roomId: string,
  deletedMessageIds: Set<string>,
) {
  const messageById = new Map<string, ChatMessage>();

  for (const serverMessage of sortMessagesByCreatedAt(serverMessages)) {
    if (
      serverMessage.roomId === roomId &&
      !deletedMessageIds.has(serverMessage.id)
    ) {
      messageById.set(serverMessage.id, serverMessage);
    }
  }

  for (const realtimeMessage of sortMessagesByCreatedAt(realtimeMessages)) {
    if (
      realtimeMessage.roomId !== roomId ||
      deletedMessageIds.has(realtimeMessage.id)
    ) {
      continue;
    }

    const serverMessage = messageById.get(realtimeMessage.id);

    if (!serverMessage || !areMessagesEqual(serverMessage, realtimeMessage)) {
      messageById.set(realtimeMessage.id, realtimeMessage);
    }
  }

  return sortMessagesByCreatedAt(Array.from(messageById.values()));
}

export function useRoomRealtime({
  roomId,
  initialMessages,
  currentUser,
  enabled,
}: UseRoomRealtimeParams) {
  const supabase = useMemo(() => createClient(), []);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const messages = useMemo(
    () =>
      mergeRealtimeMessages(
        realtimeMessages,
        initialMessages,
        roomId,
        deletedMessageIds,
      ),
    [deletedMessageIds, initialMessages, realtimeMessages, roomId],
  );
  const [status, setStatus] = useState<RealtimeConnectionStatus>("loading");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const messageByIdRef = useRef<Map<string, ChatMessage>>(new Map());
  const typingUsersRef = useRef<Map<string, TypingUser>>(new Map());
  const profileByIdRef = useRef<Map<string, ChatMessage["author"]>>(new Map());
  const deletedMessageIdsRef = useRef<Set<string>>(new Set());
  const typingTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  const upsertRealtimeMessage = useCallback((message: ChatMessage) => {
    if (deletedMessageIdsRef.current.has(message.id)) {
      return;
    }

    setRealtimeMessages((currentMessages) => {
      const existingMessage = currentMessages.find(
        (currentMessage) => currentMessage.id === message.id,
      );

      if (!existingMessage) {
        const matchingOptimisticMessage = currentMessages
          .map((currentMessage) => ({
            message: currentMessage,
            score: getOptimisticMatchScore(currentMessage, message),
          }))
          .filter(
            (
              candidate,
            ): candidate is { message: ChatMessage; score: number } =>
              candidate.score !== null,
          )
          .sort((a, b) => a.score - b.score)[0]?.message;

        if (matchingOptimisticMessage) {
          return currentMessages.map((currentMessage) =>
            currentMessage.id === matchingOptimisticMessage.id
              ? message
              : currentMessage,
          );
        }

        return sortMessagesByCreatedAt([...currentMessages, message]);
      }

      if (areMessagesEqual(existingMessage, message)) {
        return currentMessages;
      }

      return currentMessages.map((currentMessage) =>
        currentMessage.id === message.id ? message : currentMessage,
      );
    });
  }, []);

  const addOptimisticMessage = useCallback(
    ({
      content,
      replyToMessage,
    }: {
      content: string;
      replyToMessage: ChatMessageReplyPreview | null;
    }) => {
      const now = new Date().toISOString();
      const clientMessageId = createTemporaryMessageId();

      const optimisticMessage: ChatMessage = {
        id: clientMessageId,
        clientMessageId,
        roomId,
        userId: currentUser.id,
        replyToMessageId: replyToMessage?.id ?? null,
        content,
        isEdited: false,
        createdAt: now,
        updatedAt: now,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
        },
        replyToMessage,
        reactions: [],
        sendStatus: "sending",
      };

      upsertRealtimeMessage(optimisticMessage);

      return clientMessageId;
    },
    [
      currentUser.avatarUrl,
      currentUser.id,
      currentUser.username,
      roomId,
      upsertRealtimeMessage,
    ],
  );

  const confirmOptimisticMessage = useCallback(
    (clientMessageId: string, savedMessage: SavedMessageResult) => {
      setRealtimeMessages((currentMessages) => {
        const optimisticMessage = currentMessages.find(
          (message) =>
            message.id === clientMessageId ||
            message.clientMessageId === clientMessageId,
        );

        const existingSavedMessage = currentMessages.find(
          (message) => message.id === savedMessage.messageId,
        );

        if (!optimisticMessage && existingSavedMessage) {
          return currentMessages.map((message) =>
            message.id === existingSavedMessage.id
              ? {
                  ...message,
                  sendStatus: undefined,
                  clientMessageId: undefined,
                }
              : message,
          );
        }

        if (!optimisticMessage) {
          return currentMessages;
        }

        const confirmedMessage: ChatMessage = {
          ...optimisticMessage,
          id: savedMessage.messageId,
          clientMessageId: undefined,
          content: savedMessage.content,
          replyToMessageId: savedMessage.replyToMessageId,
          createdAt: savedMessage.createdAt,
          updatedAt: savedMessage.updatedAt,
          sendStatus: undefined,
        };

        const withoutOptimisticMessage = currentMessages.filter(
          (message) =>
            message.id !== optimisticMessage.id &&
            message.clientMessageId !== clientMessageId,
        );

        if (existingSavedMessage) {
          return withoutOptimisticMessage.map((message) =>
            message.id === existingSavedMessage.id
              ? {
                  ...confirmedMessage,
                  reactions: existingSavedMessage.reactions,
                }
              : message,
          );
        }

        return sortMessagesByCreatedAt([
          ...withoutOptimisticMessage,
          confirmedMessage,
        ]);
      });
    },
    [],
  );

  const failOptimisticMessage = useCallback((clientMessageId: string) => {
    setRealtimeMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === clientMessageId ||
        message.clientMessageId === clientMessageId
          ? {
              ...message,
              sendStatus: "failed",
            }
          : message,
      ),
    );
  }, []);

  const applyMessageUpdate = useCallback(
    (
      messageId: string,
      updates: Pick<ChatMessage, "content" | "isEdited" | "updatedAt">,
    ) => {
      const existingMessage = messageByIdRef.current.get(messageId);

      if (!existingMessage) {
        return;
      }

      upsertRealtimeMessage({
        ...existingMessage,
        ...updates,
      });
    },
    [upsertRealtimeMessage],
  );

  const toggleMessageReactionOptimistically = useCallback(
    (messageId: string, emoji: string) => {
      const existingMessage = messageByIdRef.current.get(messageId);

      if (!existingMessage || existingMessage.roomId !== roomId) {
        return null;
      }

      const existingReaction = existingMessage.reactions.find(
        (reaction) => reaction.emoji === emoji,
      );

      const nextReactions = existingReaction
        ? existingMessage.reactions
            .map((reaction) => {
              if (reaction.emoji !== emoji) {
                return reaction;
              }

              if (reaction.reactedByCurrentUser) {
                const nextCount = reaction.count - 1;

                return nextCount > 0
                  ? {
                      ...reaction,
                      count: nextCount,
                      reactedByCurrentUser: false,
                    }
                  : null;
              }

              return {
                ...reaction,
                count: reaction.count + 1,
                reactedByCurrentUser: true,
              };
            })
            .filter(
              (
                reaction,
              ): reaction is ChatMessageReactionSummary => reaction !== null,
            )
        : [
            ...existingMessage.reactions,
            {
              emoji,
              count: 1,
              reactedByCurrentUser: true,
            },
          ];

      const sortedNextReactions = sortReactionSummaries(nextReactions);

      const rollbackReactions = existingMessage.reactions;

      upsertRealtimeMessage({
        ...existingMessage,
        reactions: sortedNextReactions,
      });

      return () => {
        const currentMessage = messageByIdRef.current.get(messageId);

        if (!currentMessage) {
          return;
        }

        upsertRealtimeMessage({
          ...currentMessage,
          reactions: rollbackReactions,
        });
      };
    },
    [roomId, upsertRealtimeMessage],
  );

  const removeMessage = useCallback((messageId: string) => {
    deletedMessageIdsRef.current.add(messageId);

    setDeletedMessageIds((currentIds) => {
      if (currentIds.has(messageId)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(messageId);
      return nextIds;
    });

    setRealtimeMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId),
    );
  }, []);

  useEffect(() => {
    messageByIdRef.current = new Map(
      messages.map((message) => [message.id, message]),
    );
  }, [messages]);

  const publishTypingUsers = useCallback(() => {
    setTypingUsers(
      Array.from(typingUsersRef.current.values()).sort((a, b) =>
        a.username.localeCompare(b.username),
      ),
    );
  }, []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const cachedProfile = profileByIdRef.current.get(userId);

      if (cachedProfile) {
        return cachedProfile;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      const profileRow = data as ProfileRow | null;

      const profile = {
        id: profileRow?.id ?? userId,
        username: profileRow?.username ?? "Unknown user",
        avatarUrl: getSafeAvatarUrl(profileRow?.avatar_url),
      };

      profileByIdRef.current.set(userId, profile);

      return profile;
    },
    [supabase],
  );

  const applyReactionEventToMessage = useCallback(
    ({
      messageId,
      emoji,
      userId,
      eventType,
    }: {
      messageId: string;
      emoji: string;
      userId: string;
      eventType: "INSERT" | "DELETE";
    }) => {
      const existingMessage = messageByIdRef.current.get(messageId);

      if (!existingMessage || existingMessage.roomId !== roomId) {
        return;
      }

      setRealtimeMessages((currentMessages) => {
        const currentOverride = currentMessages.find(
          (message) => message.id === messageId,
        );
        const baseMessage = currentOverride ?? existingMessage;
        const existingReaction = baseMessage.reactions.find(
          (reaction) => reaction.emoji === emoji,
        );

        let nextReactions = baseMessage.reactions;

        if (eventType === "INSERT") {
          if (existingReaction) {
            if (
              userId === currentUser.id &&
              existingReaction.reactedByCurrentUser
            ) {
              return currentMessages;
            }

            nextReactions = baseMessage.reactions.map((reaction) =>
              reaction.emoji === emoji
                ? {
                    ...reaction,
                    count: reaction.count + 1,
                    reactedByCurrentUser:
                      reaction.reactedByCurrentUser || userId === currentUser.id,
                  }
                : reaction,
            );
          } else {
            nextReactions = [
              ...baseMessage.reactions,
              {
                emoji,
                count: 1,
                reactedByCurrentUser: userId === currentUser.id,
              },
            ];
          }
        }

        if (eventType === "DELETE") {
          if (!existingReaction) {
            return currentMessages;
          }

          if (
            userId === currentUser.id &&
            !existingReaction.reactedByCurrentUser
          ) {
            return currentMessages;
          }

          nextReactions = baseMessage.reactions
            .map((reaction) => {
              if (reaction.emoji !== emoji) {
                return reaction;
              }

              const nextCount = reaction.count - 1;

              if (nextCount <= 0) {
                return null;
              }

              return {
                ...reaction,
                count: nextCount,
                reactedByCurrentUser:
                  userId === currentUser.id
                    ? false
                    : reaction.reactedByCurrentUser,
              };
            })
            .filter(
              (
                reaction,
              ): reaction is ChatMessageReactionSummary => reaction !== null,
            );
        }

        const sortedReactions = sortReactionSummaries(nextReactions);

        if (areReactionSummariesEqual(baseMessage.reactions, sortedReactions)) {
          return currentMessages;
        }

        const updatedMessage = {
          ...baseMessage,
          reactions: sortedReactions,
        };

        if (!currentOverride) {
          return sortMessagesByCreatedAt([...currentMessages, updatedMessage]);
        }

        return currentMessages.map((message) =>
          message.id === messageId ? updatedMessage : message,
        );
      });
    },
    [currentUser.id, roomId],
  );

  const fetchReplyPreview = useCallback(
    async (messageId: string): Promise<ChatMessageReplyPreview | null> => {
      const existingMessage = messageByIdRef.current.get(messageId);

      if (existingMessage) {
        return {
          id: existingMessage.id,
          content: existingMessage.content,
          authorUsername: existingMessage.author.username,
          createdAt: existingMessage.createdAt,
        };
      }

      const { data: messageData } = await supabase
        .from("messages")
        .select("id, content, created_at, user_id")
        .eq("id", messageId)
        .maybeSingle();

      const replyMessage = messageData as
        | {
            id: string;
            content: string;
            created_at: string;
            user_id: string;
          }
        | null;

      if (!replyMessage) {
        return null;
      }

      const author = await fetchProfile(replyMessage.user_id);

      return {
        id: replyMessage.id,
        content: replyMessage.content,
        authorUsername: author.username,
        createdAt: new Date(replyMessage.created_at).toISOString(),
      };
    },
    [fetchProfile, supabase],
  );

  const serializeMessage = useCallback(
    async (row: MessageRow): Promise<ChatMessage> => {
      const [author, replyToMessage] = await Promise.all([
        fetchProfile(row.user_id),
        row.reply_to_message_id
          ? fetchReplyPreview(row.reply_to_message_id)
          : Promise.resolve(null),
      ]);

      return {
        id: row.id,
        roomId: row.room_id,
        userId: row.user_id,
        replyToMessageId: row.reply_to_message_id,
        content: row.content,
        isEdited: Boolean(row.is_edited),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        author,
        replyToMessage,
        reactions: [],
      };
    },
    [fetchProfile, fetchReplyPreview],
  );

  const sendTyping = useCallback(() => {
    const channel = channelRef.current;

    if (!channel || !enabled) {
      return;
    }

    void channel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        roomId,
        userId: currentUser.id,
        username: currentUser.username,
        at: new Date().toISOString(),
      } satisfies TypingPayload,
    });
  }, [currentUser.id, currentUser.username, enabled, roomId]);

  useEffect(() => {
    let isActive = true;

    if (!enabled) {
      queueMicrotask(() => {
        if (!isActive) {
          return;
        }

        setStatus("disconnected");
        setTypingUsers([]);
      });

      return () => {
        isActive = false;
      };
    }

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setStatus("loading");
      setTypingUsers([]);
    });
    typingUsersRef.current.clear();

    const channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          private: true,
          broadcast: {
            self: false,
          },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const row = payload.new as MessageRow;

          if (!isActive || row.room_id !== roomId) {
            return;
          }

          if (messageByIdRef.current.has(row.id)) {
            return;
          }

          try {
            const message = await serializeMessage(row);

            if (!isActive) {
              return;
            }

            upsertRealtimeMessage(message);
          } catch {
            setStatus("error");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const row = payload.new as MessageRow;

          if (!isActive || row.room_id !== roomId) {
            return;
          }

          try {
            const existingMessage = messageByIdRef.current.get(row.id);
            const message = await serializeMessage(row);

            if (!isActive) {
              return;
            }

            upsertRealtimeMessage({
              ...message,
              reactions: existingMessage?.reactions ?? message.reactions,
            });
          } catch {
            setStatus("error");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const row = payload.old as Partial<MessageRow>;

          if (!isActive || !row.id) {
            return;
          }

          const existingMessage = messageByIdRef.current.get(row.id);

          if (row.room_id && row.room_id !== roomId) {
            return;
          }

          if (!row.room_id && existingMessage?.roomId !== roomId) {
            return;
          }

          removeMessage(row.id);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        (payload) => {
          const nextRow = payload.new as Partial<ReactionRow>;
          const previousRow = payload.old as Partial<ReactionRow>;
          const messageId = nextRow.message_id ?? previousRow.message_id;
          const emoji = nextRow.emoji ?? previousRow.emoji;
          const userId = nextRow.user_id ?? previousRow.user_id;

          if (!isActive || !messageId || !emoji || !userId) {
            return;
          }

          try {
            if (payload.eventType === "INSERT" || payload.eventType === "DELETE") {
              applyReactionEventToMessage({
                messageId,
                emoji,
                userId,
                eventType: payload.eventType,
              });
            }
          } catch {
            setStatus("error");
          }
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const typing = payload.payload as TypingPayload;

        if (
          !isActive ||
          typing.roomId !== roomId ||
          typing.userId === currentUser.id
        ) {
          return;
        }

        const previousTimeout = typingTimeoutsRef.current.get(typing.userId);

        if (previousTimeout) {
          clearTimeout(previousTimeout);
        }

        typingUsersRef.current.set(typing.userId, {
          userId: typing.userId,
          username: typing.username,
          at: typing.at,
        });

        publishTypingUsers();

        const timeout = setTimeout(() => {
          typingUsersRef.current.delete(typing.userId);
          typingTimeoutsRef.current.delete(typing.userId);
          publishTypingUsers();
        }, 2600);

        typingTimeoutsRef.current.set(typing.userId, timeout);
      })
      .subscribe((nextStatus) => {
        if (!isActive) {
          return;
        }

        if (nextStatus === "SUBSCRIBED") {
          setStatus("connected");
          return;
        }

        if (nextStatus === "TIMED_OUT") {
          setStatus("reconnecting");
          return;
        }

        if (nextStatus === "CHANNEL_ERROR") {
          setStatus("error");
          return;
        }

        if (nextStatus === "CLOSED") {
          setStatus("disconnected");
        }
      });

    channelRef.current = channel;
    const typingTimeouts = typingTimeoutsRef.current;
    const typingUsersById = typingUsersRef.current;

    return () => {
      isActive = false;

      typingTimeouts.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.clear();
      typingUsersById.clear();
      setTypingUsers([]);

      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    currentUser.id,
    enabled,
    publishTypingUsers,
    roomId,
    serializeMessage,
    supabase,
    applyReactionEventToMessage,
    upsertRealtimeMessage,
    removeMessage,
  ]);

  return {
    messages,
    status,
    typingUsers,
    sendTyping,
    addOptimisticMessage,
    confirmOptimisticMessage,
    failOptimisticMessage,
    applyMessageUpdate,
    toggleMessageReactionOptimistically,
    removeMessage,
  };
}
