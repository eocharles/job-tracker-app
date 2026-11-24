"use client";

import { useMemo, useState } from "react";
import { STATUSES, isFollowUpDue, type Application, type Status } from "@/lib/types";
import { deleteApplication, setStatus } from "@/app/dashboard/actions";
import ApplicationForm from "@/components/ApplicationForm";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none";

export default function DashboardClient({ applications }: { applications: Application[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: applications.length };
    for (const s of STATUSES) c[s] = applications.filter((a) => a.status === s).length;
    return c;
  }, [applications]);

  const followUpCount = useMemo(() => applications.filter((a) => isFollowUpDue(a)).length, [applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (!q) return true;
      return `${a.company} ${a.role_title}`.toLowerCase().includes(q);
    });
  }, [applications, search, statusFilter]);

  async function handleStatus(id: string, status: string) {
    setError(null);
    try {
      await setStatus(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    }
  }

  async function handleDelete(app: Application) {
    if (!window.confirm(`Delete ${app.company} — ${app.role_title}? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteApplication(app.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  return (
    <div>
      {/* Status counts */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              statusFilter === s
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white hover:bg-zinc-100"
            }`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {followUpCount > 0 && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {followUpCount} application{ followUpCount === 1 ? "" : "s"} {followUpCount === 1 ? "has" : "have"} a
          follow-up due.
        </p>
      )}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* Search + add */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company or role…"
          className={`${inputClass} flex-1 min-w-52`}
        />
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowAdd((v) => !v);
          }}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          {showAdd ? "Close form" : "Add application"}
        </button>
      </div>

      {showAdd && !editing && (
        <div className="mt-4">
          <ApplicationForm onDone={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
        </div>
      )}
      {editing && (
        <div className="mt-4">
          <ApplicationForm
            application={editing}
            onDone={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* List */}
      {applications.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold">No applications yet</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Add your first application above — company, role, and status are all you need to start.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-600">No applications match that search or filter.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium">Company / Role</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Applied</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Next step</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                const due = isFollowUpDue(app);
                return (
                  <tr key={app.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{app.company}</div>
                      <div className="text-zinc-600">{app.role_title}</div>
                      {app.salary_text && (
                        <div className="text-xs text-zinc-500">{app.salary_text}</div>
                      )}
                      {app.listing_url && (
                        <a
                          href={app.listing_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          Listing
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {app.location ?? "—"}
                      {app.work_type && <div className="text-xs text-zinc-500">{app.work_type}</div>}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{app.date_applied ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatus(app.id, e.target.value)}
                        aria-label={`Status for ${app.company} ${app.role_title}`}
                        className={`${inputClass} py-1.5`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {app.next_step ? (
                        <>
                          <div>{app.next_step}</div>
                          {app.next_step_date && <div className="text-xs text-zinc-500">{app.next_step_date}</div>}
                        </>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                      {due && (
                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Follow-up due
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdd(false);
                            setEditing(app);
                          }}
                          className="underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app)}
                          className="text-red-700 underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-zinc-500">
        Showing {filtered.length} of {applications.length} application{applications.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}
