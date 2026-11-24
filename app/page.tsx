import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    signedIn = false;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Job Application Tracker</h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600">
        Keep every application in one place: the company and role, where you are in the
        process, what happens next, and when to follow up. Each account is private —
        you only ever see your own applications.
      </p>

      <ul className="mt-8 space-y-2 text-zinc-700">
        <li>— Pipeline: Saved, Applied, Screening, Interviewing, Offer, Rejected, Withdrawn</li>
        <li>— Search by company or role, and filter by status</li>
        <li>— Follow-up reminders when a next step is due</li>
        <li>— Add, edit and delete applications, with the listing link and notes kept alongside</li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        {signedIn ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-white hover:bg-zinc-700"
          >
            Go to your dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-md bg-zinc-900 px-5 py-2.5 text-white hover:bg-zinc-700"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 hover:bg-zinc-100"
            >
              Log in
            </Link>
          </>
        )}
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Free to use. Your applications are yours — no one else can see them.
      </p>
    </main>
  );
}
