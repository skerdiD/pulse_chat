"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { request } from "@arcjet/next";
import type { User } from "@supabase/supabase-js";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { authAj } from "@/lib/arcjet";
import { createClient } from "@/lib/supabase/server";
import { protectWithArcjet } from "@/server/actions/arcjet-protection";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/server/validators/auth";

type AuthActionResult = {
  ok: boolean;
  message: string;
  redirectTo?: string;
};

async function protectAuthAction(): Promise<AuthActionResult> {
  const result = await protectWithArcjet({
    actionName: "auth",
    deniedMessage: "Too many attempts. Please wait a moment and try again.",
    failureMode: "fail-closed",
    getDecision: async () => {
      const req = await request();
      return authAj.protect(req);
    },
    unavailableMessage:
      "Sign in is temporarily unavailable. Please try again in a moment.",
  });

  if (result.ok) {
    return {
      ok: true,
      message: "Allowed.",
    };
  }

  return {
    ok: false,
    message: result.error.message,
  };
}

function getProfileUsername(user: Pick<User, "email" | "user_metadata">) {
  const metadataUsername = user.user_metadata?.username;

  if (
    typeof metadataUsername === "string" &&
    metadataUsername.trim().length > 0
  ) {
    return metadataUsername.trim().slice(0, 30);
  }

  const emailUsername = user.email?.split("@")[0];

  if (emailUsername && emailUsername.trim().length > 0) {
    return emailUsername
      .replace(/[^a-zA-Z0-9_ ]/g, "")
      .trim()
      .slice(0, 30);
  }

  return "Pulse User";
}

export async function syncProfileForUser(user: User) {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !currentUser || currentUser.id !== user.id) {
    throw new Error("Unable to sync profile for this session.");
  }

  const now = new Date();
  const username = getProfileUsername(user);

  await db
    .insert(profiles)
    .values({
      id: user.id,
      username,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();
}

export async function loginAction(
  input: LoginInput,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check your email and password.",
    };
  }

  const arcjetDecision = await protectAuthAction();

  if (!arcjetDecision.ok) {
    return arcjetDecision;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      message: error?.message ?? "Unable to sign in. Please try again.",
    };
  }

  try {
    await syncProfileForUser(data.user);
  } catch {
    return {
      ok: false,
      message: "Signed in, but profile sync failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");

  return {
    ok: true,
    message: "Signed in successfully.",
    redirectTo: "/chat",
  };
}

export async function signupAction(
  input: SignupInput,
): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the signup form.",
    };
  }

  const arcjetDecision = await protectAuthAction();

  if (!arcjetDecision.ok) {
    return arcjetDecision;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
      },
    },
  });

  if (error || !data.user) {
    return {
      ok: false,
      message: error?.message ?? "Unable to create account. Please try again.",
    };
  }

  if (data.session) {
    try {
      await syncProfileForUser(data.user);
    } catch {
      return {
        ok: false,
        message: "Account created, but profile sync failed. Please try again.",
      };
    }

    revalidatePath("/", "layout");

    return {
      ok: true,
      message: "Account created successfully.",
      redirectTo: "/chat",
    };
  }

  return {
    ok: true,
    message: "Account created. Check your email to confirm your account.",
    redirectTo: "/login",
  };
}

export async function logoutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
