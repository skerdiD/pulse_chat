"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { loginAction } from "@/server/actions/auth";
import { loginSchema, type LoginInput } from "@/server/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.input<typeof loginSchema>, unknown, LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  function onSubmit(values: LoginInput) {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.ok) {
        form.setError("root", {
          type: "server",
          message: result.message,
        });
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(result.redirectTo ?? "/chat");
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-slate-200"
        >
          Email address
        </label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
            className="h-12 w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15"
          />
        </div>

        {form.formState.errors.email?.message ? (
          <p className="text-sm font-medium text-red-300">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-200"
        >
          Password
        </label>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
            className="h-12 w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15"
          />
        </div>

        {form.formState.errors.password?.message ? (
          <p className="text-sm font-medium text-red-300">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      {form.formState.errors.root?.message ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 px-5 text-sm font-black text-white shadow-xl shadow-purple-500/25 transition hover:-translate-y-0.5 hover:shadow-purple-500/35 disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
