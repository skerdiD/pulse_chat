import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { messages, profiles, roomMembers, rooms } from "../src/db/schema";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@pulsechat.app";
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "Demo123456!";
const SAMPLE_OWNER_ID = "00000000-0000-4000-8000-000000000101";
const SAMPLE_MEMBER_ID = "00000000-0000-4000-8000-000000000102";
const SAMPLE_ROOM_SLUG = "pulse-chat-demo-lounge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
}

if (!serviceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
}

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const sql = postgres(databaseUrl, {
  prepare: false,
});
const db = drizzle(sql);

async function getOrCreateDemoUser() {
  const { data: createdUser, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        username: "Demo Visitor",
      },
    });

  if (createdUser.user) {
    return createdUser.user;
  }

  if (!createError?.message.toLowerCase().includes("already")) {
    throw createError ?? new Error("Unable to create demo user.");
  }

  const { data: listedUsers, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  const existingUser = listedUsers.users.find(
    (user) => user.email?.toLowerCase() === DEMO_EMAIL.toLowerCase(),
  );

  if (!existingUser) {
    throw new Error("Demo user already exists but could not be loaded.");
  }

  const { data: updatedUser, error: updateError } =
    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        username: "Demo Visitor",
      },
    });

  if (updateError || !updatedUser.user) {
    throw updateError ?? new Error("Unable to update demo user.");
  }

  return updatedUser.user;
}

async function upsertProfile(id: string, username: string) {
  const now = new Date();

  await db
    .insert(profiles)
    .values({
      id,
      username,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        username,
        updatedAt: now,
      },
    });
}

async function seedDemoData(demoUserId: string) {
  const now = new Date();

  await upsertProfile(demoUserId, "Demo Visitor");
  await upsertProfile(SAMPLE_OWNER_ID, "Pulse Guide");
  await upsertProfile(SAMPLE_MEMBER_ID, "Sofia Team");

  const [existingRoom] = await db
    .select({
      id: rooms.id,
    })
    .from(rooms)
    .where(eq(rooms.slug, SAMPLE_ROOM_SLUG))
    .limit(1);

  const roomId =
    existingRoom?.id ??
    (
      await db
        .insert(rooms)
        .values({
          name: "Demo Lounge",
          slug: SAMPLE_ROOM_SLUG,
          description: "Sample room for exploring Pulse Chat safely.",
          ownerId: SAMPLE_OWNER_ID,
          visibility: "public",
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: rooms.id,
        })
    )[0].id;

  await db
    .insert(roomMembers)
    .values([
      {
        roomId,
        userId: SAMPLE_OWNER_ID,
        role: "owner",
        lastReadAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        roomId,
        userId: SAMPLE_MEMBER_ID,
        role: "member",
        lastReadAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        roomId,
        userId: demoUserId,
        role: "member",
        lastReadAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  const existingMessages = await db
    .select({
      id: messages.id,
    })
    .from(messages)
    .where(eq(messages.roomId, roomId))
    .limit(1);

  if (existingMessages.length === 0) {
    await db.insert(messages).values([
      {
        roomId,
        userId: SAMPLE_OWNER_ID,
        content: "Welcome to the Pulse Chat demo workspace.",
        replyToMessageId: null,
        isEdited: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 8),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 8),
      },
      {
        roomId,
        userId: SAMPLE_MEMBER_ID,
        content: "This room has sample data for testing realtime chat UX.",
        replyToMessageId: null,
        isEdited: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 4),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 4),
      },
    ]);
  }
}

async function main() {
  const demoUser = await getOrCreateDemoUser();

  await seedDemoData(demoUser.id);

  console.log(`Demo account ready: ${DEMO_EMAIL}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
