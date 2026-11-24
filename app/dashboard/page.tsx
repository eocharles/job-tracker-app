import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";
import LogoutButton from "@/components/LogoutButton";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  const { data: rows, error: listError } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (listError) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold">Your applications</h1>
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not load your applications: {listError.message}. If you have not run{" "}
          <code>supabase/schema.sql</code> yet, do that first (see the README).
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your applications</h1>
            <p className="mt-1 text-sm text-zinc-600">Signed in as {data.user.email}</p>
          </div>
        </div>
        <LogoutButton />
      </header>
      <div className="mt-8">
        <DashboardClient applications={(rows ?? []) as Application[]} />
      </div>
    </main>
  );
}
