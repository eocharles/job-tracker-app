"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured yet. Set the values in .env.local first — see the README.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setNotice(
            "Account created. Check your email for a confirmation link, then log in. (If email confirmation is turned off in Supabase, you can log in right away.)",
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {mode === "login" ? "Log in" : "Create an account"}
        </h1>
      <p className="mt-2 text-sm text-zinc-600">
        {mode === "login"
          ? "Welcome back — your applications are waiting."
          : "One account, your own private tracker. No sample data, no shared lists."}
      </p>

      {!isSupabaseConfigured && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Supabase is not configured yet. Copy <code>.env.example</code> to{" "}
          <code>.env.local</code> and fill in your project URL and anon key.
        </p>
      )}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {notice && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-600">
        {mode === "login" ? (
          <>
            No account yet? <Link href="/signup" className="font-medium text-indigo-600 underline hover:text-indigo-800">Create one</Link>.
          </>
        ) : (
          <>
            Already have an account? <Link href="/login" className="font-medium text-indigo-600 underline hover:text-indigo-800">Log in</Link>.
          </>
        )}{" "}
        <Link href="/" className="font-medium text-indigo-600 underline hover:text-indigo-800">Back home</Link>
      </p>
      </div>
    </main>
  );
}
