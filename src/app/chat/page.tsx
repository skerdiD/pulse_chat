import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatShell } from "@/components/layout/ChatShell";
import { createClient } from "@/lib/supabase/server";
import { syncProfileForUser } from "@/server/actions/auth";

export const metadata: Metadata = {
  title: "Chat | Pulse Chat",
  description: "Your protected Pulse Chat workspace.",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await syncProfileForUser(user);

  const username =
    typeof user.user_metadata?.username === "string" &&
    user.user_metadata.username.trim().length > 0
      ? user.user_metadata.username
      : user.email?.split("@")[0] ?? "Pulse User";

  return (
    <ChatShell
      user={{
        email: user.email ?? "",
        username,
      }}
    />
  );
}