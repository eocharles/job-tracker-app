"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
    >
      Log out
    </button>
  );
}
