import { getSafeAvatarUrl } from "@/lib/avatar";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

type InitialAvatarProps = {
  username: string;
  avatarUrl?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
};

const avatarSizeClasses = {
  sm: "size-10 text-sm",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
};

const statusSizeClasses = {
  sm: "size-3.5 border-[2.5px]",
  md: "size-3.5 border-[2.5px]",
  lg: "size-4 border-[3px]",
};

export function InitialAvatar({
  username,
  avatarUrl,
  alt,
  size = "md",
  showStatus = false,
  className,
}: InitialAvatarProps) {
  const safeAvatarUrl = getSafeAvatarUrl(avatarUrl);

  return (
    <div
      className={cn(
        "relative isolate shrink-0 rounded-full",
        avatarSizeClasses[size],
        className,
      )}
    >
      <div className="grid size-full place-items-center overflow-hidden rounded-full border border-slate-700/80 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 font-semibold leading-none text-white shadow-md shadow-black/25">
        {safeAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeAvatarUrl}
            alt={alt ?? `${username} avatar`}
            className="size-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid size-full translate-y-px place-items-center text-center leading-none">
            {getInitials(username)}
          </span>
        )}
      </div>

      {showStatus ? (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-[#050816] bg-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_0_12px_rgba(16,185,129,0.22)]",
            statusSizeClasses[size],
          )}
        />
      ) : null}
    </div>
  );
}
