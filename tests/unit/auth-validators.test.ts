import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "@/server/validators/auth";

describe("auth validators", () => {
  describe("loginSchema", () => {
    it("accepts a valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "skerdi@example.com",
        password: "password123"
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual({
          email: "skerdi@example.com",
          password: "password123"
        });
      }
    });

    it("trims email whitespace", () => {
      const result = loginSchema.safeParse({
        email: "  skerdi@example.com  ",
        password: "password123"
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.email).toBe("skerdi@example.com");
      }
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123"
      });

      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "skerdi@example.com",
        password: ""
      });

      expect(result.success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    it("accepts valid signup data", () => {
      const result = signupSchema.safeParse({
        username: "Skerdi Dev",
        email: "skerdi@example.com",
        password: "password123",
        confirmPassword: "password123"
      });

      expect(result.success).toBe(true);
    });

    it("normalizes extra spaces in username", () => {
      const result = signupSchema.safeParse({
        username: "  Skerdi    Dev  ",
        email: "skerdi@example.com",
        password: "password123",
        confirmPassword: "password123"
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.username).toBe("Skerdi Dev");
      }
    });

    it("rejects short usernames", () => {
      const result = signupSchema.safeParse({
        username: "Sk",
        email: "skerdi@example.com",
        password: "password123",
        confirmPassword: "password123"
      });

      expect(result.success).toBe(false);
    });

    it("rejects usernames with unsupported symbols", () => {
      const result = signupSchema.safeParse({
        username: "Skerdi!",
        email: "skerdi@example.com",
        password: "password123",
        confirmPassword: "password123"
      });

      expect(result.success).toBe(false);
    });

    it("rejects short passwords", () => {
      const result = signupSchema.safeParse({
        username: "Skerdi Dev",
        email: "skerdi@example.com",
        password: "short",
        confirmPassword: "short"
      });

      expect(result.success).toBe(false);
    });

    it("rejects passwords over 72 characters", () => {
      const result = signupSchema.safeParse({
        username: "Skerdi Dev",
        email: "skerdi@example.com",
        password: "a".repeat(73),
        confirmPassword: "a".repeat(73)
      });

      expect(result.success).toBe(false);
    });

    it("rejects password confirmation mismatch", () => {
      const result = signupSchema.safeParse({
        username: "Skerdi Dev",
        email: "skerdi@example.com",
        password: "password123",
        confirmPassword: "different123"
      });

      expect(result.success).toBe(false);
    });
  });
});
