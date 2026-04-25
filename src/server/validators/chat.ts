import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(2, "Room name must be at least 2 characters").max(50),
  description: z.string().max(160).optional(),
  isPrivate: z.boolean().default(false),
});

export const sendMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty").max(2000),
  replyToMessageId: z.string().uuid().optional().nullable(),
});

export const reactToMessageSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().min(1).max(20),
});