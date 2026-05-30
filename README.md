# Pulse Chat

**Pulse Chat** is a production-style realtime team messaging app built with **Next.js 16**, **React 19**, **TypeScript**, **Supabase Auth**, **Supabase Realtime**, **Supabase Postgres**, **Drizzle ORM**, and a polished dark SaaS interface.

It demonstrates authentication, public/private rooms, role-based permissions, private room member management, realtime messaging, replies, emoji reactions, typing indicators, unread counts, message pagination, protected server actions, validation, testing, observability, and production-minded UI/UX.

[Live Demo](https://pulse-chat-skerdid.vercel.app/) | [Repository](https://github.com/skerdiD/pulse_chat)

---

## Demo Account

Email: [demo@pulsechat.app]
Password: Demo123456!

The demo account is public and only for exploring the app experience. It uses sample rooms/messages and cannot change rooms, members, or profile settings.

To make the demo credentials work in a Supabase project, create the Auth user and sample data with:

```bash
npm run demo:seed
```

This script requires `SUPABASE_SERVICE_ROLE_KEY` in your local or deployment environment. Keep that key server-only and never expose it as a `NEXT_PUBLIC_` variable.

---

## Preview

Explore the deployed app: [pulse-chat-skerdid.vercel.app](https://pulse-chat-skerdid.vercel.app/)

### Landing Page

<img src="./public/screenshots/marketing-hero-chat-preview.png" alt="Pulse Chat marketing hero with chat preview" width="100%">
<img src="./public/screenshots/marketing-features-grid.png" alt="Pulse Chat feature grid section" width="100%">

### Chat Workspace

<img src="./public/screenshots/chat-room-sidebar-layout.png" alt="Pulse Chat main chat workspace with sidebar and room conversation" width="100%">
<img src="./public/screenshots/chat-room-collapsed-sidebar.png" alt="Pulse Chat chat workspace with collapsed sidebar rail" width="100%">

### Room Settings

<img src="./public/screenshots/room-settings-page.png" alt="Pulse Chat room settings page" width="100%">

---

## Overview

Most chat demos stop at a basic message box. Pulse Chat was built to feel closer to a real SaaS communication product with authentication, room permissions, realtime updates, private member management, unread counts, message pagination, testing, and a clean dark interface.

The goal was to show more than CRUD: realtime behavior, role-based access, database modeling, secure server actions, scalable message loading, and product-focused UX.

---

## Business Value

Pulse Chat demonstrates realtime team collaboration with secure rooms, private member management, unread counts, replies, reactions, and scalable message loading.

For clients, it shows the foundation of a practical messaging product for startups, internal teams, communities, and client portals where fast communication and controlled access both matter.

## Key Features

### Auth and Profiles

* Supabase email/password authentication
* Protected workspace with server-side sessions
* Automatic user profile sync
* Username and avatar URL settings
* Safer avatar validation with initials fallback

### Rooms and Permissions

* Public and private rooms
* Joinable public rooms
* Room sidebar with search and active states
* Owner/member role support
* Room-scoped authorization checks
* Archived-room protection
* Private room access through membership

### Private Room Management

* Add, remove, and leave private rooms
* Owner/admin permission checks
* Duplicate membership protection
* Last-owner removal protection
* Server-side validation for member actions

### Realtime Chat

* Room-scoped Supabase Realtime subscriptions
* Realtime messages, reactions, and typing indicators
* Safe subscription cleanup when switching rooms
* Stable client-side realtime lifecycle

### Messages and Read State

* Message author display and timestamps
* Edited message state
* Reply-to-message support
* Emoji reactions with counts and user-aware state
* Copy message action
* Cursor-based message pagination
* Per-user unread counts
* Last-read tracking for room members

### Security and Quality

* Protected server actions
* Zod validation for forms and mutations
* Server-side auth and membership checks
* Arcjet protection with safer error handling
* Sentry logging support
* Supabase RLS policy support
* Authorization-focused tests
* Responsive dark SaaS interface

---

## Tech Stack

### Frontend

* Next.js 16 App Router
* React 19
* TypeScript
* Tailwind CSS 4
* shadcn/ui
* Radix UI
* Lucide React
* Sonner
* React Hook Form
* Zod

### Backend and Database

* Next.js Server Actions
* Supabase Auth
* Supabase Postgres
* Supabase Realtime
* Drizzle ORM
* Typed database schema
* Room membership permissions
* Cursor-based message queries

### Tooling

* Arcjet
* Sentry
* Vitest
* Playwright
* ESLint
* TypeScript compiler
* Drizzle Kit
* GitHub Actions

---

## Architecture

```txt
Client UI
  |-- Next.js App Router / React / Tailwind / shadcn UI

Server Layer
  |-- Server Actions / Zod / Auth Checks / Permission Checks
  |-- Arcjet Protection / Sentry Logging

Database Layer
  |-- Supabase Postgres / Drizzle ORM
  |-- Profiles / Rooms / Room Members / Messages / Reactions / Read State

Realtime Layer
  |-- Supabase Realtime
  |-- Message Updates / Reaction Updates / Typing Broadcasts
```

Private room access is controlled through room membership, unread counts use user-specific read state, and pagination keeps message loading scalable.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/skerdiD/pulse_chat.git
cd pulse_chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
ARCJET_KEY=
NEXT_PUBLIC_SENTRY_DSN=
DEMO_USER_EMAIL=demo@pulsechat.app
```

For demo setup only, add the server-only Supabase key locally before running `npm run demo:seed`:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Apply Supabase RLS policies

Apply the policies from:

```txt
src/lib/supabase/policies.sql
```

### 6. Start the development server

```bash
npm run dev
```

Open the app at:

```txt
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev          # Start the development server
npm run build        # Create a production build
npm run start        # Start the production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run test:all     # Run lint, typecheck, unit tests, and E2E tests
npm run demo:seed    # Create/update the public demo account and sample data
npm run db:push      # Push schema changes to the database
npm run db:studio    # Open Drizzle Studio
```

---

## Testing and Quality

* Vitest validates utilities, validators, and server-side logic
* Playwright validates core end-to-end behavior
* TypeScript catches type-level regressions
* ESLint keeps code quality consistent
* Authorization tests protect important room and message rules

Run the full quality suite:

```bash
npm run test:all
```

---

## Author

Built by **skerdiD**.

GitHub: [@skerdiD](https://github.com/skerdiD)
