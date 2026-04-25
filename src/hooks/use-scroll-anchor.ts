"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseScrollAnchorParams = {
  itemCount: number;
  latestItemId: string | null;
  latestItemUserId: string | null;
  currentUserId: string;
};

export function useScrollAnchor({
  itemCount,
  latestItemId,
  latestItemUserId,
  currentUserId,
}: UseScrollAnchorParams) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previousLatestItemIdRef = useRef<string | null>(null);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newItemsCount, setNewItemsCount] = useState(0);

  const checkIsNearBottom = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return true;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    return distanceFromBottom < 180;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });

    setNewItemsCount(0);
    setIsNearBottom(true);
  }, []);

  const handleScroll = useCallback(() => {
    const nearBottom = checkIsNearBottom();

    setIsNearBottom(nearBottom);

    if (nearBottom) {
      setNewItemsCount(0);
    }
  }, [checkIsNearBottom]);

  useEffect(() => {
    if (itemCount === 0 || !latestItemId) {
      previousLatestItemIdRef.current = null;
      queueMicrotask(() => setNewItemsCount(0));
      return;
    }

    const previousLatestItemId = previousLatestItemIdRef.current;

    if (!previousLatestItemId) {
      previousLatestItemIdRef.current = latestItemId;

      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });

      return;
    }

    if (previousLatestItemId === latestItemId) {
      return;
    }

    previousLatestItemIdRef.current = latestItemId;

    const shouldAutoScroll =
      isNearBottom ||
      checkIsNearBottom() ||
      latestItemUserId === currentUserId;

    if (shouldAutoScroll) {
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
      return;
    }

    queueMicrotask(() => {
      setNewItemsCount((currentCount) => currentCount + 1);
    });
  }, [
    checkIsNearBottom,
    currentUserId,
    isNearBottom,
    itemCount,
    latestItemId,
    latestItemUserId,
    scrollToBottom,
  ]);

  return {
    containerRef,
    bottomRef,
    isNearBottom,
    newItemsCount,
    handleScroll,
    scrollToBottom,
  };
}
