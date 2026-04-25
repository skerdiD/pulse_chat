// src/components/layout/AuthShell.tsx
import type { ReactNode } from "react";
import Link from "next/link";

import { AppLogo } from "@/components/shared/AppLogo";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pulse-grid-bg pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Go to Pulse Chat home">
            <AppLogo />
          </Link>
        </div>

        <section className="pulse-card rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-[-0.04em] text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {description}
              </p>
            ) : null}
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}