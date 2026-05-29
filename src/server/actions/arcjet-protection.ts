import * as Sentry from "@sentry/nextjs";

import {
  actionError,
  actionSuccess,
  type ActionResponse,
} from "@/server/actions/utils";

export type ArcjetFailureMode = "fail-open" | "fail-closed";

type ArcjetProtectionDecision = {
  id?: string;
  conclusion?: string;
  isDenied(): boolean;
  isErrored(): boolean;
};

type ProtectWithArcjetOptions = {
  actionName: string;
  deniedMessage: string;
  failureMode: ArcjetFailureMode;
  getDecision: () => Promise<ArcjetProtectionDecision>;
  unavailableMessage?: string;
  userId?: string;
};

const DEFAULT_UNAVAILABLE_MESSAGE =
  "This action is temporarily unavailable. Please try again in a moment.";

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Arcjet protection failed with a non-Error value.");
}

function logArcjetFailure({
  actionName,
  decision,
  error,
  failureMode,
  userId,
}: {
  actionName: string;
  decision?: ArcjetProtectionDecision;
  error: unknown;
  failureMode: ArcjetFailureMode;
  userId?: string;
}) {
  const normalizedError = toError(error);

  try {
    Sentry.captureException(normalizedError, {
      extra: {
        actionName,
        arcjetConclusion: decision?.conclusion,
        arcjetDecisionId: decision?.id,
        failureMode,
      },
      tags: {
        "arcjet.action": actionName,
        "arcjet.failure_mode": failureMode,
      },
      user: userId ? { id: userId } : undefined,
    });
  } catch (sentryError) {
    console.error("Failed to report Arcjet protection failure.", sentryError);
    console.error(normalizedError);
  }
}

export async function protectWithArcjet({
  actionName,
  deniedMessage,
  failureMode,
  getDecision,
  unavailableMessage = DEFAULT_UNAVAILABLE_MESSAGE,
  userId,
}: ProtectWithArcjetOptions): Promise<ActionResponse<undefined>> {
  try {
    const decision = await getDecision();

    if (decision.isDenied()) {
      return actionError("RATE_LIMITED", deniedMessage);
    }

    if (decision.isErrored()) {
      logArcjetFailure({
        actionName,
        decision,
        error: new Error(`Arcjet returned an ERROR decision for ${actionName}.`),
        failureMode,
        userId,
      });

      return failureMode === "fail-open"
        ? actionSuccess(undefined)
        : actionError("INTERNAL_ERROR", unavailableMessage);
    }

    return actionSuccess(undefined);
  } catch (error) {
    logArcjetFailure({
      actionName,
      error,
      failureMode,
      userId,
    });

    return failureMode === "fail-open"
      ? actionSuccess(undefined)
      : actionError("INTERNAL_ERROR", unavailableMessage);
  }
}
