"use client";

import { useEffect, useRef, useState } from "react";
import {
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  ChevronDown,
} from "lucide-react";

import { InitialAvatar } from "@/components/chat/initial-avatar";
import { ProfileSettingsDialog } from "@/components/chat/profile-settings-dialog";
import { logoutAction } from "@/server/actions/auth";
import type { CurrentChatUser } from "@/types/chat";

type ProfileMenuProps = {
  currentUser: CurrentChatUser;
  compact?: boolean;
};

export function ProfileMenu({ currentUser, compact = false }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const avatar = (
    <InitialAvatar
      username={currentUser.username}
      avatarUrl={currentUser.avatarUrl}
      size="sm"
      showStatus
    />
  );

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={
            compact
              ? "flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 transition hover:border-purple-400/30"
              : "flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-left transition hover:border-purple-400/30 hover:bg-slate-900/70"
          }
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          {avatar}

          {!compact ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">
                  {currentUser.username}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                  {currentUser.email}
                </p>
              </div>

              <ChevronDown className="size-4 shrink-0 text-slate-500" />
            </>
          ) : null}
        </button>

        {isOpen ? (
          <div
            role="menu"
            className={
              compact
                ? "absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black/50"
                : "absolute bottom-[calc(100%+0.75rem)] left-0 z-40 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black/50"
            }
          >
            <div className="mb-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center gap-3">
                {avatar}
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {currentUser.username}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-200">
                <ShieldCheck className="size-3.5" />
                Signed in
              </div>
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsSettingsOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <Settings className="size-4" />
              Profile settings
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsSettingsOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <UserRound className="size-4" />
              Edit username/avatar
            </button>

            <div className="my-2 h-px bg-slate-800" />

            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <ProfileSettingsDialog
        currentUser={currentUser}
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  );
}
