# Job Application Tracker

A multi-user web app for tracking job applications. Each person signs up with
their own account and only ever sees their own applications.

**What it does**
- Sign up / log in with email and password (Supabase Auth)
- Dashboard with counts by status, search by company or role, and filter by status
- Pipeline: Saved, Applied, Screening, Interviewing, Offer, Rejected, Withdrawn
- Add, edit, delete, and change the status of applications
- Fields: company, role, location, work type, salary (as listed), source, listing
  link, date applied, contact, next step, next-step date, notes
- Follow-up flag when a next step is due (today or earlier) on an open application
- Starts empty — no sample data and no copied-in applications

**Stack**
- Next.js 16 (App Router, TypeScript) + Tailwind CSS 4
- Supabase: Auth (email/password) + Postgres, with Row Level Security
- Deploy target: Vercel (free tier) + Supabase (free tier)

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev                  # http://localhost:3000
```

## Supabase setup

1. Create a free project at https://supabase.com (no credit card needed for the free tier).
2. In the Supabase dashboard, open **SQL Editor → New query**, paste the whole
   contents of `supabase/schema.sql`, and run it. This creates the `applications`
   table, the `updated_at` trigger, and the Row Level Security policies so each
   user can only SELECT / INSERT / UPDATE / DELETE their own rows
   (`user_id = auth.uid()`).
3. In **Project Settings → API**, copy the **Project URL** and the **anon / public**
   key into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In **Authentication → Providers → Email**, leave email sign-up enabled.
   Email confirmation is on by default: after signing up, a user clicks the link
   in the confirmation email, which returns to `/auth/callback` and then to the
   dashboard. If you turn confirmation off, sign-up logs the user straight in.
5. Restart `npm run dev` after changing `.env.local`.

Never commit `.env.local` or paste real keys into the code, README, or chat.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In https://vercel.com, **Add New → Project**, import that repository.
   Framework preset: Next.js. No build settings need changing.
3. In the Vercel project, go to **Settings → Environment Variables** and add the
   same two variables as above (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for Production (and Preview, if you want
   preview deploys to work).
4. Deploy. The landing page is at `/`, sign-up at `/signup`, log-in at `/login`,
   and the protected dashboard at `/dashboard`.
5. In Supabase, **Authentication → URL Configuration**, set the **Site URL** to
   your Vercel URL (e.g. `https://job-tracker-app.vercel.app`) and add
   `https://job-tracker-app.vercel.app/auth/callback` under Redirect URLs, so
   email-confirmation links come back to the deployed app instead of localhost.

## Project layout

```
app/
  page.tsx               Landing page
  login/  signup/        Auth pages (client forms)
  dashboard/             Protected dashboard + server actions
    page.tsx  actions.ts
  auth/callback/route.ts Email-confirmation callback
components/
  AuthForm.tsx  ApplicationForm.tsx  DashboardClient.tsx  LogoutButton.tsx
lib/
  types.ts               Status list + Application type + follow-up rule
  supabase/client.ts     Browser client
  supabase/server.ts     Server client (cookies)
  supabase/middleware.ts Session refresh, used by proxy.ts
proxy.ts                 Refreshes the Supabase session on each request
supabase/schema.sql      Table + RLS policies (run once in Supabase)
.env.example             Placeholder env vars only — no real values
```

## What is NOT included

- No email reminders or notifications (follow-ups are flagged on the dashboard only)
- No resume or cover-letter uploads, no Gmail/LinkedIn import
- No admin panel, no sharing between users, no public profiles
- No payment, no analytics, no custom domain (add one in Vercel later if wanted)
- No data migration from any private tracker — users start empty and add their own
