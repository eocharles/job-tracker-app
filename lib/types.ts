export const STATUSES = [
  "Saved",
  "Applied",
  "Screening",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type Status = (typeof STATUSES)[number];

export const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Co-op"] as const;

/** Badge colors per pipeline stage. Full literal class names so Tailwind v4 picks them up. */
export const STATUS_BADGE: Record<Status, string> = {
  Saved: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  Applied: "bg-sky-100 text-sky-800 ring-sky-200",
  Screening: "bg-violet-100 text-violet-800 ring-violet-200",
  Interviewing: "bg-amber-100 text-amber-800 ring-amber-200",
  Offer: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Rejected: "bg-red-100 text-red-800 ring-red-200",
  Withdrawn: "bg-stone-100 text-stone-600 ring-stone-200",
};

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role_title: string;
  location: string | null;
  work_type: string | null;
  salary_text: string | null;
  source: string | null;
  listing_url: string | null;
  date_applied: string | null;
  status: Status;
  contact_name: string | null;
  next_step: string | null;
  next_step_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** True when a follow-up is due: a next-step date of today or earlier, on an open application. */
export function isFollowUpDue(app: Application, today = new Date()): boolean {
  if (!app.next_step_date) return false;
  if (app.status === "Offer" || app.status === "Rejected" || app.status === "Withdrawn") {
    return false;
  }
  // Compare date-only, in local time, so timezone does not shift the day.
  const due = new Date(`${app.next_step_date}T00:00:00`);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due.getTime() <= startOfToday.getTime();
}
