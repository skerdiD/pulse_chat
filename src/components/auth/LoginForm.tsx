"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { KeyRound, Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { loginAction } from "@/server/actions/auth";
import { loginSchema, type LoginInput } from "@/server/validators/auth";

const DEMO_EMAIL = "demo@pulsechat.app";
const DEMO_PASSWORD = "Demo123456!";

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

  function fillDemoCredentials() {
    form.clearErrors();
    form.setValue("email", DEMO_EMAIL, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue("password", DEMO_PASSWORD, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 text-sm shadow-inner shadow-purple-950/20">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-purple-300/20 bg-slate-950/70 text-purple-200">
            <KeyRound className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-black text-purple-100">Demo Account</p>
            <dl className="mt-2 space-y-1 text-xs font-semibold text-slate-300">
              <div className="flex min-w-0 gap-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="truncate text-slate-100">{DEMO_EMAIL}</dd>
              </div>
              <div className="flex min-w-0 gap-2">
                <dt className="text-slate-500">Password</dt>
                <dd className="truncate text-slate-100">{DEMO_PASSWORD}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Public sample access for exploring the app experience.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fillDemoCredentials}
          disabled={isPending}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-purple-300/20 bg-slate-950/70 px-4 text-xs font-black text-purple-100 transition hover:border-purple-300/40 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Fill demo credentials
        </button>
      </div>

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
