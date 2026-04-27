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

function sortMessagesByCreatedAt(messages: ChatMessage[]) {
  return [...messages].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
}

function buildReactionSummaries(
  rows: ReactionRow[],
  currentUserId: string,
): ChatMessageReactionSummary[] {
  const byEmoji = new Map<
    string,
    {
      emoji: string;
      count: number;
      reactedByCurrentUser: boolean;
    }
  >();

  for (const row of rows) {
    const existing =
      byEmoji.get(row.emoji) ??
      {
        emoji: row.emoji,
        count: 0,
        reactedByCurrentUser: false,
      };

    existing.count += 1;

    if (row.user_id === currentUserId) {
      existing.reactedByCurrentUser = true;
    }

    byEmoji.set(row.emoji, existing);
  }

  return Array.from(byEmoji.values()).sort((a, b) => {
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

export function useRoomRealtime({
  roomId,
  initialMessages,
  currentUser,
  enabled,
}: UseRoomRealtimeParams) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    sortMessagesByCreatedAt(initialMessages),
  );
  const [status, setStatus] = useState<RealtimeConnectionStatus>("loading");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const messageByIdRef = useRef<Map<string, ChatMessage>>(new Map());
  const typingUsersRef = useRef<Map<string, TypingUser>>(new Map());
  const profileByIdRef = useRef<Map<string, ChatMessage["author"]>>(new Map());
  const typingTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

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

  const fetchReactionSummaries = useCallback(
    async (messageId: string) => {
      const { data } = await supabase
        .from("message_reactions")
        .select("id, message_id, user_id, emoji, created_at")
        .eq("message_id", messageId);

      return buildReactionSummaries(
        (data ?? []) as ReactionRow[],
        currentUser.id,
      );
    },
    [currentUser.id, supabase],
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

  const updateMessageReactions = useCallback(
    async (messageId: string) => {
      const existingMessage = messageByIdRef.current.get(messageId);

      if (!existingMessage) {
        return;
      }

      if (existingMessage.roomId !== roomId) {
        return;
      }

      const reactions = await fetchReactionSummaries(messageId);

      setMessages((currentMessages) => {
        let didUpdate = false;

        const nextMessages = currentMessages.map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          if (areReactionSummariesEqual(message.reactions, reactions)) {
            return message;
          }

          didUpdate = true;

          return {
            ...message,
            reactions,
          };
        });

        return didUpdate ? nextMessages : currentMessages;
      });
    },
    [fetchReactionSummaries, roomId],
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

            setMessages((currentMessages) => {
              if (
                currentMessages.some(
                  (currentMessage) => currentMessage.id === message.id,
                )
              ) {
                return currentMessages;
              }

              return sortMessagesByCreatedAt([...currentMessages, message]);
            });
          } catch {
            setStatus("error");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        async (payload) => {
          const nextRow = payload.new as Partial<ReactionRow>;
          const previousRow = payload.old as Partial<ReactionRow>;
          const messageId = nextRow.message_id ?? previousRow.message_id;

          if (!isActive || !messageId) {
            return;
          }

          try {
            await updateMessageReactions(messageId);
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
    updateMessageReactions,
  ]);

  return {
    messages,
    status,
    typingUsers,
    sendTyping,
  };
}
