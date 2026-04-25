import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login | Pulse Chat",
  description: "Log in to your Pulse Chat account.",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/chat");
  }

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in to Pulse Chat"
      description="Continue to your real-time chat workspace and manage your rooms, messages, and team conversations."
      footerText="Don't have an account?"
      footerHref="/signup"
      footerLinkText="Create account"
    >
      <LoginForm />
    </AuthShell>
  );
}