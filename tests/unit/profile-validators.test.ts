import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/server/validators/profile";

describe("profile validators", () => {
  it("accepts a valid profile update", () => {
    const result = updateProfileSchema.safeParse({
      username: "Skerdi Dev",
      avatarUrl: "https://example.com/avatar.png"
    });

    expect(result.success).toBe(true);
  });

  it("normalizes username spacing", () => {
    const result = updateProfileSchema.safeParse({
      username: "  Skerdi    Dev  ",
      avatarUrl: ""
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.username).toBe("Skerdi Dev");
    }
  });

  it("turns empty avatar URL into undefined", () => {
    const result = updateProfileSchema.safeParse({
      username: "Skerdi Dev",
      avatarUrl: "   "
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.avatarUrl).toBeUndefined();
    }
  });

  it("allows omitted avatar URL", () => {
    const result = updateProfileSchema.safeParse({
      username: "Skerdi Dev"
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.avatarUrl).toBeUndefined();
    }
  });

  it("accepts usernames at the 30 character limit", () => {
    const username = "a".repeat(30);

    const result = updateProfileSchema.safeParse({
      username,
      avatarUrl: ""
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.username).toBe(username);
    }
  });

  it("rejects short usernames", () => {
    const result = updateProfileSchema.safeParse({
      username: "Sk",
      avatarUrl: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects usernames over 30 characters", () => {
    const result = updateProfileSchema.safeParse({
      username: "a".repeat(31),
      avatarUrl: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects usernames with unsupported symbols", () => {
    const result = updateProfileSchema.safeParse({
      username: "Skerdi!",
      avatarUrl: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid avatar URLs", () => {
    const result = updateProfileSchema.safeParse({
      username: "Skerdi Dev",
      avatarUrl: "not-a-url"
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-http avatar URLs", () => {
    const result = updateProfileSchema.safeParse({
      username: "Skerdi Dev",
      avatarUrl: "javascript:alert(1)"
    });

    expect(result.success).toBe(false);
  });

  it("rejects ftp avatar URLs", () => {
    const result = updateProfileSchema.safeParse({
      username: "Skerdi Dev",
      avatarUrl: "ftp://example.com/avatar.png"
    });

    expect(result.success).toBe(false);
  });

  it("rejects avatar URLs over 500 characters", () => {
    const longUrl = `https://example.com/${"a".repeat(500)}`;

    const result = updateProfileSchema.safeParse({
      username: "Skerdi Dev",
      avatarUrl: longUrl
    });

    expect(result.success).toBe(false);
  });
});
