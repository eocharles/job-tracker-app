import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white ${className ?? "h-9 w-9"}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

const FEATURES = [
  {
    title: "Track the whole pipeline",
    text: "Saved, Applied, Screening, Interviewing, Offer — plus Rejected and Withdrawn. Every application has a place, and you always know where it stands.",
  },
  {
    title: "Search and filter instantly",
    text: "Find any company or role in seconds, filter by status, and sort by date applied or company name.",
  },
  {
    title: "Never miss a follow-up",
    text: "Set a next step and a date for each application. Anything due gets flagged at the top of your dashboard.",
  },
];

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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-indigo-950 text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <BrandMark />
            Job Application Tracker
          </Link>
          <nav className="flex items-center gap-2">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-indigo-950 hover:bg-indigo-100"
              >
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-900 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Create an account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="bg-indigo-950 pb-20 pt-14 text-white sm:pt-20">
          <div className="mx-auto w-full max-w-5xl px-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">
              Your job search, organized
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Every application. One clear picture.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-indigo-200">
              Keep every application in one place: the company and role, where you are in
              the process, what happens next, and when to follow up. Each account is
              private — you only ever see your own applications.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {signedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Go to your dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    Create an account — it&apos;s free
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-md border border-indigo-700 bg-indigo-900 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-800"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-5xl px-6 py-14">
          <div className="grid gap-5 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-zinc-500">
            Free to use. Your applications are yours — no one else can see them.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-950 py-6 text-center text-sm text-indigo-300">
        Job Application Tracker — built for the job hunt.
      </footer>
    </div>
  );
}
