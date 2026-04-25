"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
  requireActionUser,
  withAuthedValidatedInput,
} from "@/server/actions/utils";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/server/validators/profile";
import type { CurrentChatUser } from "@/types/chat";

export async function getCurrentUserProfile(): Promise<
  ActionResponse<{
    profile: CurrentChatUser;
  }>
> {
  const auth = await requireActionUser();

  if (!auth.ok) {
    return actionError(auth.error.code, auth.error.message);
  }

  const user = auth.data;

  const [profile] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) {
    return actionError("NOT_FOUND", "Profile was not found.");
  }

  return actionSuccess({
    profile: {
      id: profile.id,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      email: user.email ?? "",
    },
  });
}

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<
  ActionResponse<{
    profile: CurrentChatUser;
  }>
> {
  return withAuthedValidatedInput(
    updateProfileSchema,
    input,
    async ({ input, user }) => {
      const avatarUrl = input.avatarUrl ?? null;
      const now = new Date();

      try {
        const [updatedProfile] = await db
          .update(profiles)
          .set({
            username: input.username,
            avatarUrl,
            updatedAt: now,
          })
          .where(eq(profiles.id, user.id))
          .returning({
            id: profiles.id,
            username: profiles.username,
            avatarUrl: profiles.avatarUrl,
          });

        if (!updatedProfile) {
          return actionError("NOT_FOUND", "Profile was not found.");
        }

        const supabase = await createClient();

        await supabase.auth.updateUser({
          data: {
            username: input.username,
            avatar_url: avatarUrl,
          },
        });

        revalidatePath("/chat");

        return actionSuccess(
          {
            profile: {
              id: updatedProfile.id,
              email: user.email ?? "",
              username: updatedProfile.username,
              avatarUrl: updatedProfile.avatarUrl,
            },
          },
          "Profile updated successfully.",
        );
      } catch {
        return actionError(
          "INTERNAL_ERROR",
          "Unable to update profile. Please try again.",
        );
      }
    },
  );
}