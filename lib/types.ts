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
