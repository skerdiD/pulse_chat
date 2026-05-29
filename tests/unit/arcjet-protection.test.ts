import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";
import { protectWithArcjet } from "@/server/actions/arcjet-protection";

const captureException = vi.mocked(Sentry.captureException);

function createDecision({
  conclusion = "ALLOW",
  denied = false,
  errored = false,
  id = "req_test",
}: {
  conclusion?: string;
  denied?: boolean;
  errored?: boolean;
  id?: string;
} = {}) {
  return {
    conclusion,
    id,
    isDenied: () => denied,
    isErrored: () => errored,
  };
}

describe("protectWithArcjet", () => {
  beforeEach(() => {
    captureException.mockClear();
  });

  it("allows a clean Arcjet decision", async () => {
    const result = await protectWithArcjet({
      actionName: "send_message",
      deniedMessage: "Too fast.",
      failureMode: "fail-open",
      getDecision: async () => createDecision(),
      userId: "user_123",
    });

    expect(result).toEqual({
      ok: true,
      data: undefined,
    });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("keeps existing rate limit behavior for denied decisions", async () => {
    const result = await protectWithArcjet({
      actionName: "send_message",
      deniedMessage: "Too fast.",
      failureMode: "fail-open",
      getDecision: async () =>
        createDecision({ conclusion: "DENY", denied: true }),
      userId: "user_123",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too fast.",
      },
    });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("logs Arcjet error decisions and fails open when configured", async () => {
    const result = await protectWithArcjet({
      actionName: "send_message",
      deniedMessage: "Too fast.",
      failureMode: "fail-open",
      getDecision: async () =>
        createDecision({
          conclusion: "ERROR",
          errored: true,
          id: "req_arcjet_error",
        }),
      userId: "user_123",
    });

    expect(result).toEqual({
      ok: true,
      data: undefined,
    });
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({
          actionName: "send_message",
          arcjetConclusion: "ERROR",
          arcjetDecisionId: "req_arcjet_error",
          failureMode: "fail-open",
        }),
        tags: expect.objectContaining({
          "arcjet.action": "send_message",
          "arcjet.failure_mode": "fail-open",
        }),
        user: { id: "user_123" },
      }),
    );
  });

  it("logs thrown Arcjet failures and fails closed when configured", async () => {
    const result = await protectWithArcjet({
      actionName: "auth",
      deniedMessage: "Too many attempts.",
      failureMode: "fail-closed",
      getDecision: async () => {
        throw new Error("Arcjet API unavailable");
      },
      unavailableMessage:
        "Sign in is temporarily unavailable. Please try again in a moment.",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          "Sign in is temporarily unavailable. Please try again in a moment.",
      },
    });
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({
          actionName: "auth",
          failureMode: "fail-closed",
        }),
        tags: expect.objectContaining({
          "arcjet.action": "auth",
          "arcjet.failure_mode": "fail-closed",
        }),
      }),
    );
  });
});
