PartyPilot is an AI event planner built with Next.js App Router, Supabase Auth/Database, and Gemini. It generates complete event plans with playlists, food, activities, timelines, budget allocation, and practical hosting tips.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and RLS-backed tables
- Gemini API via `@google/genai`

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `events`
- `event_plans`
- Row Level Security policies so users can only access their own data

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` landing page
- `/login` and `/signup`
- `/dashboard` protected event overview
- `/events/new` multi-step planner wizard
- `/events/[id]` printable/PDF-ready event report

## Deployment

Deploy to Vercel, add the environment variables above, and run the SQL schema in Supabase before inviting users.
