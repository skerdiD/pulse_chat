// src/components/layout/MarketingNavbar.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppLogo } from "@/components/shared/AppLogo";

const navItems = [
  { label: "Open app", href: "/chat" },
  { label: "Features", href: "#features" },
];

export function MarketingNavbar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <Link href="/" aria-label="Go to Pulse Chat home">
        <AppLogo />
      </Link>

      <nav className="hidden items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950/45 p-1 shadow-xl shadow-black/20 backdrop-blur-xl md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-300 transition hover:text-white sm:inline-flex"
        >
          Sign in
        </Link>
        <Link href="/signup" className="pulse-primary-button min-h-10 px-4 py-2">
          Get started
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </header>
  );
}
