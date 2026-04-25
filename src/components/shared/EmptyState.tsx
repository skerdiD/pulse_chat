// src/components/shared/EmptyState.tsx
import type { LucideIcon } from "lucide-react";
import { MessageSquareText } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon: Icon = MessageSquareText,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-4 py-10">
      <div className="pulse-soft-card w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
          <Icon className="size-6" />
        </div>

        <h3 className="text-xl font-black tracking-[-0.03em] text-white">
          {title}
        </h3>

        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {description}
          </p>
        ) : null}

        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}