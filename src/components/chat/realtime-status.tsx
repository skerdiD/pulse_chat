import { Loader2, Wifi, WifiOff } from "lucide-react";

import type { RealtimeConnectionStatus } from "@/types/chat";

type RealtimeStatusProps = {
  status: RealtimeConnectionStatus;
};

const statusConfig: Record<
  RealtimeConnectionStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
    icon: "wifi" | "loader" | "off";
  }
> = {
  connected: {
    label: "Live",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 shadow-emerald-500/5",
    dotClassName: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]",
    icon: "wifi",
  },
  loading: {
    label: "Connecting",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-200 shadow-amber-500/5",
    dotClassName: "bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]",
    icon: "loader",
  },
  reconnecting: {
    label: "Reconnecting",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-200 shadow-amber-500/5",
    dotClassName: "bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]",
    icon: "loader",
  },
  disconnected: {
    label: "Offline",
    className:
      "border-slate-700 bg-slate-900 text-slate-400 shadow-black/10",
    dotClassName: "bg-slate-500",
    icon: "off",
  },
  error: {
    label: "Error",
    className:
      "border-red-400/20 bg-red-500/10 text-red-200 shadow-red-500/5",
    dotClassName: "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.9)]",
    icon: "off",
  },
};

export function RealtimeStatus({ status }: RealtimeStatusProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`hidden h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black shadow-lg sm:inline-flex ${config.className}`}
      title={`Realtime status: ${config.label}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClassName}`} />

      {config.icon === "wifi" ? <Wifi className="size-3.5" /> : null}
      {config.icon === "loader" ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : null}
      {config.icon === "off" ? <WifiOff className="size-3.5" /> : null}

      <span>{config.label}</span>
    </div>
  );
}