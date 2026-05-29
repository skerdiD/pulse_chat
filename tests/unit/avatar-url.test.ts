import { describe, expect, it } from "vitest";

import {
  getSafeAvatarUrl,
  isSafeAvatarUrl,
  MAX_AVATAR_URL_LENGTH,
} from "@/lib/avatar";

describe("avatar URL safety", () => {
  it("allows http and https avatar URLs", () => {
    expect(isSafeAvatarUrl("https://example.com/avatar.png")).toBe(true);
    expect(isSafeAvatarUrl("http://example.com/avatar.png")).toBe(true);
  });

  it("allows common image extensions and hosted image URLs without extensions", () => {
    expect(isSafeAvatarUrl("https://example.com/avatar.webp?size=96")).toBe(
      true,
    );
    expect(isSafeAvatarUrl("https://images.example.com/u/12345")).toBe(true);
    expect(
      isSafeAvatarUrl("https://cdn.example.com/avatar?id=12345&format=webp"),
    ).toBe(true);
  });

  it("rejects javascript, data, ftp, and malformed avatar URLs", () => {
    expect(isSafeAvatarUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeAvatarUrl("data:image/svg+xml,<svg></svg>")).toBe(false);
    expect(isSafeAvatarUrl("ftp://example.com/avatar.png")).toBe(false);
    expect(isSafeAvatarUrl("not-a-url")).toBe(false);
  });

  it("rejects empty, overlong, credentialed, and obvious non-image URLs", () => {
    const longUrl = `https://example.com/${"a".repeat(MAX_AVATAR_URL_LENGTH)}`;

    expect(isSafeAvatarUrl("")).toBe(false);
    expect(isSafeAvatarUrl("   ")).toBe(false);
    expect(isSafeAvatarUrl(longUrl)).toBe(false);
    expect(isSafeAvatarUrl("https://user:pass@example.com/avatar.png")).toBe(
      false,
    );
    expect(isSafeAvatarUrl("https://example.com/profile.html")).toBe(false);
    expect(isSafeAvatarUrl("https://example.com/avatar.js")).toBe(false);
  });

  it("normalizes unsafe or empty avatar values to null", () => {
    expect(getSafeAvatarUrl(null)).toBeNull();
    expect(getSafeAvatarUrl(undefined)).toBeNull();
    expect(getSafeAvatarUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeAvatarUrl("https://example.com/avatar.png")).toBe(
      "https://example.com/avatar.png",
    );
  });

  it("trims safe avatar URLs before rendering", () => {
    expect(getSafeAvatarUrl("  https://example.com/avatar.png  ")).toBe(
      "https://example.com/avatar.png",
    );
  });
});
