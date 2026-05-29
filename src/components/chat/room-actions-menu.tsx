"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LogOut, PencilLine, Settings, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";

import {
  canDeleteRoom,
  canEditRoom,
  canManageRoomMembers,
  getRoomSettingsHref,
} from "@/components/chat/room-deletion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteRoomAction, leaveRoomAction } from "@/server/actions/rooms";
import type { ChatRoom } from "@/types/chat";

type RoomActionsMenuProps = {
  room: ChatRoom;
  onDeleted: (roomId: string) => void;
};

export function RoomActionsMenu({
  room,
  onDeleted,
}: RoomActionsMenuProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canOpenSettings = canEditRoom(room) || canManageRoomMembers(room);
  const canLeaveRoom = room.isMember && room.currentUserRole !== "owner";

  if (!canOpenSettings && !canDeleteRoom(room) && !canLeaveRoom) {
    return null;
  }

  function handleDeleteRoom() {
    startTransition(async () => {
      const result = await deleteRoomAction({
        roomId: room.id,
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      setIsDialogOpen(false);
      setIsMenuOpen(false);
      toast.success(result.message ?? "Room deleted.");
      onDeleted(room.id);
    });
  }

  function handleLeaveRoom() {
    startTransition(async () => {
      const result = await leaveRoomAction(room.id);

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      setIsLeaveDialogOpen(false);
      setIsMenuOpen(false);
      toast.success(result.message ?? "Left room.");
      onDeleted(room.id);
    });
  }

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            aria-label="Room settings"
          >
            <Settings className="size-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 rounded-xl border border-slate-800 bg-slate-950 p-1.5 text-slate-200 shadow-2xl shadow-black/40 ring-1 ring-slate-800"
        >
          {canOpenSettings ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setIsMenuOpen(false);
                router.push(getRoomSettingsHref(room.id));
              }}
              className="rounded-lg px-2.5 py-2 text-sm"
            >
              {canEditRoom(room) ? (
                <PencilLine className="size-4" />
              ) : (
                <UsersRound className="size-4" />
              )}
              {canEditRoom(room) ? "Edit room" : "Manage members"}
            </DropdownMenuItem>
          ) : null}

          {canOpenSettings && (canDeleteRoom(room) || canLeaveRoom) ? (
            <DropdownMenuSeparator className="bg-slate-800" />
          ) : null}

          {canLeaveRoom ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                setIsMenuOpen(false);
                setIsLeaveDialogOpen(true);
              }}
              className="rounded-lg px-2.5 py-2 text-sm"
            >
              <LogOut className="size-4" />
              Leave room
            </DropdownMenuItem>
          ) : null}

          {canLeaveRoom && canDeleteRoom(room) ? (
            <DropdownMenuSeparator className="bg-slate-800" />
          ) : null}

          {canDeleteRoom(room) ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                setIsMenuOpen(false);
                setIsDialogOpen(true);
              }}
              className="rounded-lg px-2.5 py-2 text-sm"
            >
              <Trash2 className="size-4" />
              Delete room
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (isPending) {
            return;
          }

          setIsDialogOpen(open);
        }}
      >
        <DialogContent
          showCloseButton={!isPending}
          className="max-w-md gap-0 rounded-[1.5rem] border border-slate-800 bg-slate-950 p-0 text-white shadow-2xl shadow-black/50 ring-1 ring-slate-800"
        >
          <div className="px-6 py-6">
            <DialogHeader className="gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-200">
                <Trash2 className="size-5" />
              </div>

              <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-white">
                Delete room
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-slate-400">
                Delete{" "}
                <span className="font-semibold text-slate-100">
                  {room.name}
                </span>{" "}
                for everyone. The room will be removed from active chat views
                and can no longer receive messages.
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="rounded-b-[1.5rem] border-slate-800 bg-slate-950/95 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsDialogOpen(false)}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDeleteRoom}
              className="border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
            >
              {isPending ? "Deleting..." : "Delete room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isLeaveDialogOpen}
        onOpenChange={(open) => {
          if (isPending) {
            return;
          }

          setIsLeaveDialogOpen(open);
        }}
      >
        <DialogContent
          showCloseButton={!isPending}
          className="max-w-md gap-0 rounded-[1.5rem] border border-slate-800 bg-slate-950 p-0 text-white shadow-2xl shadow-black/50 ring-1 ring-slate-800"
        >
          <div className="px-6 py-6">
            <DialogHeader className="gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-200">
                <LogOut className="size-5" />
              </div>

              <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-white">
                Leave room
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-slate-400">
                Leave{" "}
                <span className="font-semibold text-slate-100">
                  {room.name}
                </span>
                . You will lose access unless an owner or admin adds you back.
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="rounded-b-[1.5rem] border-slate-800 bg-slate-950/95 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsLeaveDialogOpen(false)}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleLeaveRoom}
              className="border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
            >
              {isPending ? "Leaving..." : "Leave room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
