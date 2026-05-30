import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getDemoUserEmail, isDemoUser } from "@/server/demo-user";

describe("demo user helper", () => {
  const originalDemoEmail = process.env.DEMO_USER_EMAIL;

  afterEach(() => {
    process.env.DEMO_USER_EMAIL = originalDemoEmail;
  });

  it("uses the public demo email by default", () => {
    delete process.env.DEMO_USER_EMAIL;

    expect(getDemoUserEmail()).toBe("demo@pulsechat.app");
    expect(isDemoUser({ email: "demo@pulsechat.app" })).toBe(true);
  });

  it("normalizes configured demo email checks", () => {
    process.env.DEMO_USER_EMAIL = "  Demo.User@PulseChat.app  ";

    expect(getDemoUserEmail()).toBe("demo.user@pulsechat.app");
    expect(isDemoUser({ email: " demo.user@pulsechat.app " })).toBe(true);
    expect(isDemoUser({ email: "other@example.com" })).toBe(false);
  });
});
