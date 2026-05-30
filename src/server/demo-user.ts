import "server-only";

import type { User } from "@supabase/supabase-js";

const DEFAULT_DEMO_USER_EMAIL = "demo@pulsechat.app";

export function getDemoUserEmail() {
  return (process.env.DEMO_USER_EMAIL ?? DEFAULT_DEMO_USER_EMAIL)
    .trim()
    .toLowerCase();
}

export function isDemoUser(user: Pick<User, "email">) {
  const demoEmail = getDemoUserEmail();

  return Boolean(user.email && user.email.trim().toLowerCase() === demoEmail);
}
