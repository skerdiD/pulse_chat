import "server-only";

import { ZodError, type z } from "zod";
import type { User } from "@supabase/supabase-js";

import { AuthRequiredError, requireUser } from "@/server/auth";

export type ActionFieldErrors = Record<string, string[]>;

export type ActionErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export type ActionError = {
  code: ActionErrorCode;
  message: string;
  fieldErrors?: ActionFieldErrors;
};

export type ActionResponse<TData = undefined> =
  | {
      ok: true;
      message?: string;
      data: TData;
    }
  | {
      ok: false;
      error: ActionError;
    };

export function actionSuccess<TData>(
  data: TData,
  message?: string,
): ActionResponse<TData> {
  return {
    ok: true,
    message,
    data,
  };
}

export function actionError(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: ActionFieldErrors,
): ActionResponse<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      fieldErrors,
    },
  };
}

export function getZodFieldErrors(error: ZodError): ActionFieldErrors {
  const flattened = error.flatten().fieldErrors;
  const fieldErrors: ActionFieldErrors = {};

  for (const [field, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      fieldErrors[field] = messages;
    }
  }

  return fieldErrors;
}

export function validateActionInput<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): ActionResponse<z.infer<TSchema>> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return actionError(
      "VALIDATION_ERROR",
      "Please check the form and try again.",
      getZodFieldErrors(parsed.error),
    );
  }

  return actionSuccess(parsed.data);
}

export async function requireActionUser(): Promise<ActionResponse<User>> {
  try {
    const user = await requireUser();

    return actionSuccess(user);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return actionError("UNAUTHENTICATED", error.message);
    }

    return actionError("INTERNAL_ERROR", "Unable to verify your session.");
  }
}

export async function withValidatedInput<TSchema extends z.ZodTypeAny, TData>(
  schema: TSchema,
  input: unknown,
  handler: (input: z.infer<TSchema>) => Promise<ActionResponse<TData>>,
): Promise<ActionResponse<TData>> {
  const validation = validateActionInput(schema, input);

  if (!validation.ok) {
    return validation;
  }

  return handler(validation.data);
}

export async function withAuthedValidatedInput<
  TSchema extends z.ZodTypeAny,
  TData,
>(
  schema: TSchema,
  input: unknown,
  handler: (params: {
    input: z.infer<TSchema>;
    user: User;
  }) => Promise<ActionResponse<TData>>,
): Promise<ActionResponse<TData>> {
  const validation = validateActionInput(schema, input);

  if (!validation.ok) {
    return validation;
  }

  const auth = await requireActionUser();

  if (!auth.ok) {
    return auth;
  }

  return handler({
    input: validation.data,
    user: auth.data,
  });
}