import { cn } from "@/lib/utils";

type AppLogoProps = {
  compact?: boolean;
};

export function PulseLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Pulse Chat"
      className={cn("size-10", className)}
    >
      <defs>
        <linearGradient id="pulse-logo-shell" x1="6" y1="5" x2="34" y2="35">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="0.58" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="pulse-logo-line" x1="11" y1="20" x2="30" y2="20">
          <stop offset="0" stopColor="#a7f3d0" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>

      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="13"
        fill="url(#pulse-logo-shell)"
      />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="12.5"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
      />
      <path
        d="M12 12.75h16c3.15 0 5.7 2.38 5.7 5.32v5.02c0 2.94-2.55 5.32-5.7 5.32h-6.77l-5.14 4.08c-.73.58-1.8.06-1.8-.87v-3.21H12c-3.15 0-5.7-2.38-5.7-5.32v-5.02c0-2.94 2.55-5.32 5.7-5.32Z"
        fill="#0f172a"
        fillOpacity="0.82"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.4"
      />
      <path
        d="M11 21h4.12l2.05-4.78 3.35 9.3 2.24-5.27h6.24"
        fill="none"
        stroke="url(#pulse-logo-line)"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="31"
        cy="11"
        r="3.25"
        fill="#34d399"
        stroke="#020617"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <div
      className={cn("flex items-center gap-2.5", compact && "justify-center")}
    >
      <PulseLogoMark className="shrink-0 drop-shadow-[0_12px_24px_rgba(124,58,237,0.22)]" />

      <div className={cn("leading-none", compact && "sr-only")}>
        <p className="text-[17px] font-semibold text-white">
          Pulse Chat
        </p>
        <p className="mt-1 text-[10px] font-medium uppercase text-slate-400">
          Realtime
        </p>
      </div>
    </div>
  );
}
