import { describe, expect, it } from "vitest";

import { getSafeAvatarUrl, isSafeAvatarUrl } from "@/lib/avatar";

describe("avatar URL safety", () => {
  it("allows http and https avatar URLs", () => {
    expect(isSafeAvatarUrl("https://example.com/avatar.png")).toBe(true);
    expect(isSafeAvatarUrl("http://example.com/avatar.png")).toBe(true);
  });

  it("rejects javascript, data, ftp, and malformed avatar URLs", () => {
    expect(isSafeAvatarUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeAvatarUrl("data:image/svg+xml,<svg></svg>")).toBe(false);
    expect(isSafeAvatarUrl("ftp://example.com/avatar.png")).toBe(false);
    expect(isSafeAvatarUrl("not-a-url")).toBe(false);
  });

  it("normalizes unsafe or empty avatar values to null", () => {
    expect(getSafeAvatarUrl(null)).toBeNull();
    expect(getSafeAvatarUrl(undefined)).toBeNull();
    expect(getSafeAvatarUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeAvatarUrl("https://example.com/avatar.png")).toBe(
      "https://example.com/avatar.png",
    );
  });
});
