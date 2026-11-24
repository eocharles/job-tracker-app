import AuthForm from "@/components/AuthForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/dashboard");
  } catch {
    // Not signed in (or Supabase not configured) — show the login form.
  }
  return <AuthForm mode="login" />;
}
