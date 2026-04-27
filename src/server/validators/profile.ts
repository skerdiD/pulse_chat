import { z } from "zod";

import { isSafeAvatarUrl } from "@/lib/avatar";

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or less.")
    .regex(
      /^[a-zA-Z0-9_ ]+$/,
      "Username can only use letters, numbers, spaces, and underscores.",
    )
    .transform((value) => value.replace(/\s+/g, " ").trim()),
  avatarUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(
      z
        .string()
        .url("Enter a valid avatar URL.")
        .refine(isSafeAvatarUrl, {
          message: "Avatar URL must start with http:// or https://.",
        })
        .max(500, "Avatar URL must be 500 characters or less.")
        .optional(),
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
