import { describe, expect, it } from "vitest";
import {
  addRoomMemberSchema,
  createRoomSchema,
  deleteRoomSchema,
  getMessagesForRoomSchema,
  messageIdSchema,
  removeRoomMemberSchema,
  roomIdSchema,
  sendMessageSchema,
  toggleReactionSchema,
  updateMessageSchema,
  updateRoomSchema
} from "@/server/validators/chat";

const validRoomId = "11111111-1111-4111-8111-111111111111";
const validMessageId = "22222222-2222-4222-8222-222222222222";
const validUserId = "33333333-3333-4333-8333-333333333333";

describe("chat validators", () => {
  describe("createRoomSchema", () => {
    it("accepts valid public room data", () => {
      const result = createRoomSchema.safeParse({
        name: "General",
        description: "Main team room",
        visibility: "public"
      });

      expect(result.success).toBe(true);
    });

    it("defaults visibility to public", () => {
      const result = createRoomSchema.safeParse({
        name: "General"
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.visibility).toBe("public");
      }
    });

    it("normalizes room name whitespace", () => {
      const result = createRoomSchema.safeParse({
        name: "  Design    Team  ",
        visibility: "private"
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe("Design Team");
      }
    });

    it("turns empty description into undefined", () => {
      const result = createRoomSchema.safeParse({
        name: "General",
        description: "   ",
        visibility: "public"
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("rejects room names that are too short", () => {
      const result = createRoomSchema.safeParse({
        name: "A",
        visibility: "public"
      });

      expect(result.success).toBe(false);
    });

    it("rejects descriptions over 240 characters", () => {
      const result = createRoomSchema.safeParse({
        name: "General",
        description: "a".repeat(241),
        visibility: "public"
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid visibility", () => {
      const result = createRoomSchema.safeParse({
        name: "General",
        visibility: "secret"
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateRoomSchema", () => {
    it("accepts partial room updates", () => {
      const result = updateRoomSchema.safeParse({
        roomId: validRoomId,
        name: "Updated Room"
      });

      expect(result.success).toBe(true);
    });

    it("rejects invalid room id", () => {
      const result = updateRoomSchema.safeParse({
        roomId: "bad-id",
        name: "Updated Room"
      });

      expect(result.success).toBe(false);
    });
  });

  describe("roomIdSchema", () => {
    it("accepts valid room id", () => {
      const result = roomIdSchema.safeParse({
        roomId: validRoomId
      });

      expect(result.success).toBe(true);
    });

    it("rejects invalid room id", () => {
      const result = roomIdSchema.safeParse({
        roomId: "invalid"
      });

      expect(result.success).toBe(false);
    });
  });

  describe("sendMessageSchema", () => {
    it("accepts a valid message", () => {
      const result = sendMessageSchema.safeParse({
        roomId: validRoomId,
        content: "Hello team",
        replyToMessageId: null
      });

      expect(result.success).toBe(true);
    });

    it("trims message content", () => {
      const result = sendMessageSchema.safeParse({
        roomId: validRoomId,
        content: "  Hello team  "
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.content).toBe("Hello team");
      }
    });

    it("accepts valid reply target id", () => {
      const result = sendMessageSchema.safeParse({
        roomId: validRoomId,
        content: "Replying here",
        replyToMessageId: validMessageId
      });

      expect(result.success).toBe(true);
    });

    it("accepts content at the 2000 character limit", () => {
      const result = sendMessageSchema.safeParse({
        roomId: validRoomId,
        content: "a".repeat(2000)
      });

      expect(result.success).toBe(true);
    });

    it("rejects empty message content", () => {
      const result = sendMessageSchema.safeParse({
        roomId: validRoomId,
        content: "   "
      });

      expect(result.success).toBe(false);
    });

    it("rejects content over 2000 characters", () => {
      const result = sendMessageSchema.safeParse({
        roomId: validRoomId,
        content: "a".repeat(2001)
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid reply target id", () => {
      const result = sendMessageSchema.safeParse({
        roomId: validRoomId,
        content: "Replying here",
        replyToMessageId: "bad-id"
      });

      expect(result.success).toBe(false);
    });

  });

  describe("getMessagesForRoomSchema", () => {
    it("defaults message pagination limit", () => {
      const result = getMessagesForRoomSchema.safeParse({
        roomId: validRoomId
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.limit).toBe(30);
        expect(result.data.cursor).toBeUndefined();
      }
    });

    it("accepts a valid message cursor", () => {
      const result = getMessagesForRoomSchema.safeParse({
        roomId: validRoomId,
        limit: 20,
        cursor: {
          id: validMessageId,
          createdAt: "2026-05-29T12:00:00.000Z"
        }
      });

      expect(result.success).toBe(true);
    });

    it("rejects invalid pagination limits", () => {
      const result = getMessagesForRoomSchema.safeParse({
        roomId: validRoomId,
        limit: 61
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid message cursors", () => {
      const result = getMessagesForRoomSchema.safeParse({
        roomId: validRoomId,
        cursor: {
          id: "bad-id",
          createdAt: "not-a-date"
        }
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateMessageSchema", () => {
    it("accepts a valid message update", () => {
      const result = updateMessageSchema.safeParse({
        messageId: validMessageId,
        content: "Edited message"
      });

      expect(result.success).toBe(true);
    });

    it("rejects empty edited content", () => {
      const result = updateMessageSchema.safeParse({
        messageId: validMessageId,
        content: ""
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid edited message id", () => {
      const result = updateMessageSchema.safeParse({
        messageId: "bad-id",
        content: "Edited message"
      });

      expect(result.success).toBe(false);
    });

    it("rejects edited content over 2000 characters", () => {
      const result = updateMessageSchema.safeParse({
        messageId: validMessageId,
        content: "a".repeat(2001)
      });

      expect(result.success).toBe(false);
    });
  });

  describe("deleteRoomSchema", () => {
    it("accepts valid room deletion input", () => {
      const result = deleteRoomSchema.safeParse({
        roomId: validRoomId
      });

      expect(result.success).toBe(true);
    });

    it("rejects invalid room deletion input", () => {
      const result = deleteRoomSchema.safeParse({
        roomId: "bad-room-id"
      });

      expect(result.success).toBe(false);
    });
  });

  describe("messageIdSchema", () => {
    it("accepts valid message id", () => {
      const result = messageIdSchema.safeParse({
        messageId: validMessageId
      });

      expect(result.success).toBe(true);
    });

    it("rejects invalid message id", () => {
      const result = messageIdSchema.safeParse({
        messageId: "invalid"
      });

      expect(result.success).toBe(false);
    });
  });

  describe("toggleReactionSchema", () => {
    it("accepts a valid reaction value", () => {
      const result = toggleReactionSchema.safeParse({
        messageId: validMessageId,
        emoji: ":fire:"
      });

      expect(result.success).toBe(true);
    });

    it("trims reaction values", () => {
      const result = toggleReactionSchema.safeParse({
        messageId: validMessageId,
        emoji: "  :rocket:  "
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.emoji).toBe(":rocket:");
      }
    });

    it("rejects invalid reaction message id", () => {
      const result = toggleReactionSchema.safeParse({
        messageId: "bad-id",
        emoji: ":fire:"
      });

      expect(result.success).toBe(false);
    });

    it("rejects empty emoji", () => {
      const result = toggleReactionSchema.safeParse({
        messageId: validMessageId,
        emoji: ""
      });

      expect(result.success).toBe(false);
    });

    it("rejects very long emoji values", () => {
      const result = toggleReactionSchema.safeParse({
        messageId: validMessageId,
        emoji: "a".repeat(33)
      });

      expect(result.success).toBe(false);
    });
  });

  describe("room member schemas", () => {
    it("accepts valid add room member input", () => {
      const result = addRoomMemberSchema.safeParse({
        roomId: validRoomId,
        userId: validUserId,
        role: "member"
      });

      expect(result.success).toBe(true);
    });

    it("defaults added room member role to member", () => {
      const result = addRoomMemberSchema.safeParse({
        roomId: validRoomId,
        userId: validUserId
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.role).toBe("member");
      }
    });

    it("rejects invalid room member role", () => {
      const result = addRoomMemberSchema.safeParse({
        roomId: validRoomId,
        userId: validUserId,
        role: "super-admin"
      });

      expect(result.success).toBe(false);
    });

    it("accepts valid remove room member input", () => {
      const result = removeRoomMemberSchema.safeParse({
        roomId: validRoomId,
        userId: validUserId
      });

      expect(result.success).toBe(true);
    });
  });
});
