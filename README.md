# Pulse Chat

**Pulse Chat** is a production-style realtime team messaging app built with **Next.js 16**, **React 19**, **TypeScript**, **Supabase Auth**, **Supabase Realtime**, **Supabase Postgres**, **Drizzle ORM**, and a polished dark SaaS interface.

It demonstrates authentication, room-based permissions, realtime messaging, replies, emoji reactions, typing indicators, profile management, protected server actions, validation, testing, observability, and production-minded UI/UX.

[Live Demo](https://pulse-chat-seven.vercel.app/) · [Repository](https://github.com/skerdiD/pulse_chat) · [Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started)

---

## Preview

### Live App

https://pulse-chat-seven.vercel.app/

### Marketing Hero

![Pulse Chat marketing hero with chat preview](public/screenshots/marketing-hero-chat-preview.png)

### Feature Grid

![Pulse Chat feature grid section](public/screenshots/marketing-features-grid.png)

### Signup Experience

![Pulse Chat signup page auth shell](public/screenshots/signup-page-auth-shell.png)

### Chat Workspace

![Pulse Chat main chat workspace with sidebar and room conversation](public/screenshots/chat-room-sidebar-layout.png)

### Collapsed Sidebar

![Pulse Chat chat workspace with collapsed sidebar rail](public/screenshots/chat-room-collapsed-sidebar.png)

### Room Settings

![Pulse Chat room settings page](public/screenshots/room-settings-page.png)

---

## Overview

Most chat demos stop at a basic message box. Pulse Chat was built to feel closer to a real SaaS communication product.

The app includes authenticated users, public and private rooms, room membership logic, realtime message delivery, typing indicators, emoji reactions, replies, protected server actions, profile settings, testing, and a responsive premium interface.

The goal was not only to build a working chat app, but to show product thinking, user experience, security, realtime behavior, maintainable architecture, and business value.

---

## Features

### Authentication and Profiles

* Email and password authentication with Supabase Auth
* Protected chat workspace
* Server-side session handling
* User profile sync after authentication
* Profile settings page
* Username updates
* Optional avatar URL support
* Safe avatar URL validation

### Rooms and Permissions

* Create public and private rooms
* Join available public rooms
* Room sidebar with search, active states, and metadata
* Owner/member role support
* Room member tracking
* Owner-only room management actions
* Archived-room protection logic
* Room-scoped permission checks

### Realtime Chat

* Send and receive messages in realtime
* Supabase Realtime subscriptions
* Room-scoped realtime updates
* Realtime connection status
* Safe subscription cleanup when switching rooms
* Optimized message rendering for smoother usage

### Messages and Reactions

* Message author display
* Avatar and initials fallback
* Message timestamps
* Edited message state
* Reply-to-message support
* Reply preview in composer
* Message hover actions
* Copy message action
* Add and remove emoji reactions
* Realtime reaction updates
* Reaction counts
* User-aware reaction state

### Typing Indicators

* Room-scoped typing indicators
* Realtime typing broadcasts
* Cleanup logic to prevent stale typing states
* Better feedback during active conversations

### Security and Validation

* Server-side authorization checks
* Room membership checks
* Owner-only protected actions
* Zod validation for forms and server actions
* Arcjet protection for sensitive actions
* Supabase Row Level Security policy support
* Environment-variable based configuration
* Private realtime channel support

### Performance and UX

* Responsive desktop, tablet, and mobile layout
* Premium dark SaaS interface
* Loading and pending states
* Smooth form interactions
* Optimized room and message rendering
* Reduced unnecessary UI re-renders
* Stable realtime subscription cleanup
* Production build support

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

* Supabase Auth
* Supabase Postgres
* Supabase Realtime
* Drizzle ORM
* Next.js Server Actions
* Server-side validation

### Security and Observability

* Arcjet
* Supabase Row Level Security
* Sentry
* Environment-based secrets

### Testing and Tooling

* Vitest
* Playwright
* ESLint
* TypeScript compiler
* Drizzle Kit
* GitHub Actions

---

## Architecture Overview

Pulse Chat uses a modern full-stack architecture built around the Next.js App Router.

```txt
Client UI
  |-- Next.js App Router
  |-- React Components
  |-- Tailwind CSS / shadcn UI

Server Layer
  |-- Server Actions
  |-- Zod Validation
  |-- Auth Checks
  |-- Permission Checks
  |-- Arcjet Protection

Database Layer
  |-- Supabase Postgres
  |-- Drizzle ORM
  |-- Row Level Security

Realtime Layer
  |-- Supabase Realtime
  |-- Message Updates
  |-- Reaction Updates
  |-- Typing Broadcasts

Quality Layer
  |-- ESLint
  |-- TypeScript
  |-- Vitest
  |-- Playwright
  |-- Sentry
```

The app keeps realtime behavior room-scoped, validates user actions on the server, and protects sensitive flows with authorization checks before writing to the database.

---

## Product Flow

1. A user signs up or logs in.
2. The app creates or syncs the user profile.
3. The user enters the protected chat workspace.
4. The user can create, join, or manage rooms.
5. Room members can send messages in realtime.
6. Users can reply, react, copy messages, and see typing indicators.
7. Profile settings allow username and avatar updates.
8. Server actions validate and protect important mutations.

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

Create a `.env.local` file in the root of the project.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
ARCJET_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Apply Supabase RLS policies

Open the Supabase SQL Editor and apply the policies from:

```txt
src/lib/supabase/policies.sql

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
npm run db:push      # Push schema changes to the database
npm run db:studio    # Open Drizzle Studio
```

---

## Testing and Quality

Pulse Chat includes a practical quality setup designed to catch issues across the main product flow.

* **Vitest** validates smaller utilities and logic.
* **Playwright** validates core end-to-end behavior.
* **TypeScript** catches type-level regressions.
* **ESLint** keeps code quality consistent.
* **Production builds** confirm the app can compile for deployment.

Run the full quality suite:

```bash
npm run test:all
```

---

## What This Project Demonstrates

Pulse Chat shows experience with more than basic CRUD development.

It demonstrates:

* Full-stack product architecture
* Realtime application behavior
* Authentication and protected routes
* Database modeling with typed ORM access
* Server-side validation and authorization
* Room-based permissions
* Realtime subscriptions and cleanup
* UI/UX polish for SaaS-style products
* Testing and production-readiness
* Security-focused engineering decisions

---

## Business Value

Pulse Chat represents the type of internal communication tool that teams, creators, agencies, and online communities often need.

From a business perspective, this project supports:

* Faster team communication
* Community-based discussion spaces
* Private and public collaboration rooms
* Real-time customer or member support
* Lightweight internal messaging
* Creator or agency community management
* A foundation for a paid SaaS communication product

The strongest business value is not only the chat feature itself, but the system behind it: authentication, permissions, realtime updates, room management, reliable UI, and a structure that can be extended into a real product.

---

## Author

Built by **skerdiD**.

GitHub: [@skerdiD](https://github.com/skerdiD)
