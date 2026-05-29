import { z } from "zod";

export const roomVisibilityValues = ["public", "private"] as const;
export const roomMemberRoleValues = ["owner", "admin", "member"] as const;

export const createRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Room name must be at least 2 characters.")
    .max(80, "Room name must be 80 characters or less.")
    .transform((value) => value.replace(/\s+/g, " ").trim()),
  description: z
    .string()
    .trim()
    .max(240, "Description must be 240 characters or less.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  visibility: z.enum(roomVisibilityValues).default("public"),
});

export const updateRoomSchema = z.object({
  roomId: z.string().uuid("Invalid room id."),
  name: z
    .string()
    .trim()
    .min(2, "Room name must be at least 2 characters.")
    .max(80, "Room name must be 80 characters or less.")
    .optional()
    .transform((value) => value?.replace(/\s+/g, " ").trim()),
  description: z
    .string()
    .trim()
    .max(240, "Description must be 240 characters or less.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  visibility: z.enum(roomVisibilityValues).optional(),
});

export const roomIdSchema = z.object({
  roomId: z.string().uuid("Invalid room id."),
});

export const joinRoomSchema = roomIdSchema;
export const deleteRoomSchema = roomIdSchema;

export const messagePageLimitSchema = z.number().int().min(1).max(60);

export const messageCursorSchema = z.object({
  id: z.string().uuid("Invalid message cursor."),
  createdAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Invalid message cursor.",
    }),
});

export const getMessagesForRoomSchema = roomIdSchema.extend({
  limit: messagePageLimitSchema.optional().default(30),
  cursor: messageCursorSchema.nullable().optional(),
});

export const sendMessageSchema = z.object({
  roomId: z.string().uuid("Invalid room id."),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be 2000 characters or less."),
  replyToMessageId: z
    .string()
    .uuid("Invalid reply message id.")
    .nullable()
    .optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string().uuid("Invalid message id."),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be 2000 characters or less."),
});

export const messageIdSchema = z.object({
  messageId: z.string().uuid("Invalid message id."),
});

export const toggleReactionSchema = z.object({
  messageId: z.string().uuid("Invalid message id."),
  emoji: z
    .string()
    .trim()
    .min(1, "Emoji is required.")
    .max(32, "Emoji value is too long."),
});

export const addRoomMemberSchema = z.object({
  roomId: z.string().uuid("Invalid room id."),
  userId: z.string().uuid("Invalid user id."),
  role: z.enum(roomMemberRoleValues).default("member"),
});

export const removeRoomMemberSchema = z.object({
  roomId: z.string().uuid("Invalid room id."),
  userId: z.string().uuid("Invalid user id."),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomIdInput = z.infer<typeof roomIdSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type DeleteRoomInput = z.infer<typeof deleteRoomSchema>;
export type GetMessagesForRoomInput = z.input<typeof getMessagesForRoomSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type MessageIdInput = z.infer<typeof messageIdSchema>;
export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
export type AddRoomMemberInput = z.infer<typeof addRoomMemberSchema>;
export type RemoveRoomMemberInput = z.infer<typeof removeRoomMemberSchema>;
