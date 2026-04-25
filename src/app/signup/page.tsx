import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/SignupForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign up | Pulse Chat",
  description: "Create your Pulse Chat account.",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/chat");
  }

  return (
    <AuthShell
      badge="Start building"
      title="Create your account"
      description="Set up your Pulse Chat profile and get ready to join rooms, reply with context, and collaborate in real time."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Sign in"
    >
      <SignupForm />
    </AuthShell>
  );
}