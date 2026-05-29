import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const roomVisibilityEnum = pgEnum("room_visibility", [
  "public",
  "private",
]);

export const roomMemberRoleEnum = pgEnum("room_member_role", [
  "owner",
  "admin",
  "member",
]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    username: varchar("username", { length: 30 }).notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    usernameIdx: index("profiles_username_idx").on(table.username),
  }),
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    visibility: roomVisibilityEnum("visibility").notNull().default("public"),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugUnique: uniqueIndex("rooms_slug_unique").on(table.slug),
    ownerIdx: index("rooms_owner_id_idx").on(table.ownerId),
    visibilityIdx: index("rooms_visibility_idx").on(table.visibility),
    createdAtIdx: index("rooms_created_at_idx").on(table.createdAt),
  }),
);

export const roomMembers = pgTable(
  "room_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: roomMemberRoleEnum("role").notNull().default("member"),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    roomUserUnique: uniqueIndex("room_members_room_id_user_id_unique").on(
      table.roomId,
      table.userId,
    ),
    roomIdx: index("room_members_room_id_idx").on(table.roomId),
    userIdx: index("room_members_user_id_idx").on(table.userId),
    roleIdx: index("room_members_role_idx").on(table.role),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    replyToMessageId: uuid("reply_to_message_id").references(
      (): AnyPgColumn => messages.id,
      { onDelete: "set null" },
    ),
    content: text("content").notNull(),
    isEdited: boolean("is_edited").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    roomCreatedAtIdx: index("messages_room_id_created_at_idx").on(
      table.roomId,
      table.createdAt,
    ),
    roomIdx: index("messages_room_id_idx").on(table.roomId),
    userIdx: index("messages_user_id_idx").on(table.userId),
    replyToIdx: index("messages_reply_to_message_id_idx").on(
      table.replyToMessageId,
    ),
  }),
);

export const messageReactions = pgTable(
  "message_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    emoji: varchar("emoji", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sameEmojiUnique: uniqueIndex(
      "message_reactions_message_id_user_id_emoji_unique",
    ).on(table.messageId, table.userId, table.emoji),
    messageIdx: index("message_reactions_message_id_idx").on(table.messageId),
    userIdx: index("message_reactions_user_id_idx").on(table.userId),
    messageEmojiIdx: index("message_reactions_message_id_emoji_idx").on(
      table.messageId,
      table.emoji,
    ),
  }),
);

export const profilesRelations = relations(profiles, ({ many }) => ({
  ownedRooms: many(rooms, { relationName: "room_owner" }),
  memberships: many(roomMembers),
  messages: many(messages),
  reactions: many(messageReactions),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [rooms.ownerId],
    references: [profiles.id],
    relationName: "room_owner",
  }),
  members: many(roomMembers),
  messages: many(messages),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
  user: one(profiles, {
    fields: [roomMembers.userId],
    references: [profiles.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
  user: one(profiles, {
    fields: [messages.userId],
    references: [profiles.id],
  }),
  replyToMessage: one(messages, {
    fields: [messages.replyToMessageId],
    references: [messages.id],
    relationName: "message_replies",
  }),
  replies: many(messages, { relationName: "message_replies" }),
  reactions: many(messageReactions),
}));

export const messageReactionsRelations = relations(
  messageReactions,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageReactions.messageId],
      references: [messages.id],
    }),
    user: one(profiles, {
      fields: [messageReactions.userId],
      references: [profiles.id],
    }),
  }),
);
