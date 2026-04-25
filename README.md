# Pulse Chat

Pulse Chat is a premium real-time room-based chat web app for teams, creators, and small communities.

It is built as a polished portfolio-level SaaS product with authentication, profiles, rooms, messages, replies, emoji reactions, typing indicators, and Supabase Realtime.

## Features

- Email/password authentication with Supabase Auth
- Protected chat workspace
- User profile sync
- Profile settings with username and optional avatar URL
- Public and private rooms
- Room creation and joining
- Room sidebar with search and active states
- Member list and room settings
- Messages with author, avatar, timestamp, and reply preview
- Message composer with reply state
- Message hover actions
- Copy message
- Emoji reactions
- Live message updates with Supabase Realtime
- Live reaction updates with Supabase Realtime
- Typing indicators
- Realtime connection status
- Responsive desktop, tablet, and mobile layout
- Premium dark SaaS UI
- Arcjet protection for important actions
- Zod validation for server actions and forms
- Drizzle ORM for typed database access

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Drizzle ORM
- Arcjet
- Zod
- React Hook Form
- Lucide React
- Sonner

## Environment Variables

Create `.env.local` and add the following variable names:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
ARCJET_KEY=