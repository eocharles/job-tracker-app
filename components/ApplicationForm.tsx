"use client";

import { useState } from "react";
import { STATUSES, WORK_TYPES, type Application } from "@/lib/types";
import { createApplication, updateApplication } from "@/app/dashboard/actions";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "block text-sm font-medium";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      {required ? " *" : ""}
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={`${inputClass} mt-1`}
      />
    </label>
  );
}

export default function ApplicationForm({
  application,
  onDone,
  onCancel,
}: {
  application?: Application;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setBusy(true);
    try {
      if (application) {
        await updateApplication(application.id, formData);
      } else {
        await createApplication(formData);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <h2 className="border-l-4 border-indigo-600 pl-3 text-lg font-semibold">
        {application ? "Edit application" : "Add an application"}
      </h2>
      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Company" name="company" required defaultValue={application?.company} />
        <Field label="Role title" name="role_title" required defaultValue={application?.role_title} />
        <Field label="Location" name="location" defaultValue={application?.location} placeholder="Toronto, ON (Hybrid)" />
        <label className={labelClass}>
          Work type
          <select name="work_type" defaultValue={application?.work_type ?? ""} className={`${inputClass} mt-1`}>
            <option value="">—</option>
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <Field label="Salary (as listed)" name="salary_text" defaultValue={application?.salary_text} placeholder="$70,000–$80,000" />
        <Field label="Source" name="source" defaultValue={application?.source} placeholder="LinkedIn, company site…" />
        <Field label="Listing link" name="listing_url" type="url" defaultValue={application?.listing_url} placeholder="https://…" />
        <Field label="Date applied" name="date_applied" type="date" defaultValue={application?.date_applied} />
        <label className={labelClass}>
          Status
          <select name="status" defaultValue={application?.status ?? "Saved"} className={`${inputClass} mt-1`}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <Field label="Contact" name="contact_name" defaultValue={application?.contact_name} />
        <Field label="Next step" name="next_step" defaultValue={application?.next_step} placeholder="Follow up with recruiter" />
        <Field label="Next step date" name="next_step_date" type="date" defaultValue={application?.next_step_date} />
      </div>

      <label className={`${labelClass} mt-4`}>
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={application?.notes ?? ""}
          className={`${inputClass} mt-1`}
        />
      </label>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : application ? "Save changes" : "Add application"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
