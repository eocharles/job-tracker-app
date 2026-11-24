"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, type Status } from "@/lib/types";

function text(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function requiredText(formData: FormData, key: string): string {
  const value = text(formData, key);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return { supabase, user: data.user };
}

export async function createApplication(formData: FormData) {
  const { supabase, user } = await requireUser();
  const status = requiredText(formData, "status");
  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status");
  }
  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company: requiredText(formData, "company"),
    role_title: requiredText(formData, "role_title"),
    location: text(formData, "location"),
    work_type: text(formData, "work_type"),
    salary_text: text(formData, "salary_text"),
    source: text(formData, "source"),
    listing_url: text(formData, "listing_url"),
    date_applied: text(formData, "date_applied"),
    status: status as Status,
    contact_name: text(formData, "contact_name"),
    next_step: text(formData, "next_step"),
    next_step_date: text(formData, "next_step_date"),
    notes: text(formData, "notes"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function updateApplication(id: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const status = requiredText(formData, "status");
  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status");
  }
  const { error } = await supabase
    .from("applications")
    .update({
      company: requiredText(formData, "company"),
      role_title: requiredText(formData, "role_title"),
      location: text(formData, "location"),
      work_type: text(formData, "work_type"),
      salary_text: text(formData, "salary_text"),
      source: text(formData, "source"),
      listing_url: text(formData, "listing_url"),
      date_applied: text(formData, "date_applied"),
      status: status as Status,
      contact_name: text(formData, "contact_name"),
      next_step: text(formData, "next_step"),
      next_step_date: text(formData, "next_step_date"),
      notes: text(formData, "notes"),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function setStatus(id: string, status: string) {
  const { supabase, user } = await requireUser();
  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status");
  }
  const { error } = await supabase
    .from("applications")
    .update({ status: status as Status })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function deleteApplication(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
