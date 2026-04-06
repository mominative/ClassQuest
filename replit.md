# ClassQuest

A gamified task management web app for classrooms, built with React, TypeScript, and Supabase.

## Architecture

This is a **pure frontend** React application (no custom backend server). It connects directly to a Supabase project for:
- **Authentication** - Email/password sign-up and sign-in via Supabase Auth
- **Database** - PostgreSQL via Supabase (Tables: Tasks, profiles, messages, submissions, user_roles)
- **Real-time** - Live task updates and chat via Supabase Realtime subscriptions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **UI**: Tailwind CSS, shadcn/ui components, Radix UI
- **State/Data**: TanStack React Query, Supabase JS client
- **Auth**: Supabase Auth (email/password)
- **Animations**: Framer Motion

## Key Features

- User authentication with role-based access (admin / user)
- Task board with status tracking (todo / in_progress / done)
- XP reward system — completing tasks awards XP and levels up user profiles
- Real-time team chat (messages table with Supabase Realtime)
- Dashboard showing stats (XP, level, streak)

## Project Structure

```
src/
  App.tsx              # Routes and auth-protected routes
  pages/
    Auth.tsx           # Login / sign-up page
    DashboardPage.tsx  # Main dashboard with stats
    Dashboard.tsx      # Task list view (used by DashboardPage)
    TasksPage.tsx      # Full task management page
    ChatPage.tsx       # Real-time team chat
    NotFound.tsx       # 404 page
  components/
    AppLayout.tsx      # Shell layout with sidebar
    AppSidebar.tsx     # Navigation sidebar
    StatCard.tsx       # XP/level stat display card
    AssignmentCard.tsx # Task card component
    BottomNav.tsx      # Mobile bottom navigation
  hooks/
    useAuth.tsx        # Auth context/provider (session, role)
    useTasks.tsx       # Task CRUD + real-time updates
    useProfile.tsx     # User profile data
  integrations/
    supabase/
      client.ts        # Supabase client (uses env vars)
      types.ts         # Generated database types
```

## Environment Variables

Set in Replit environment (shared):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID

## Development

The app runs with `npm run dev` on port 5000. Vite handles hot module replacement.

## Deployment

This is a static site. Build with `npm run build` — output goes to `dist/`.
