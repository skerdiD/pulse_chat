import { LogOut } from "lucide-react";

import { logoutAction } from "@/server/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 text-sm font-bold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </form>
  );
}