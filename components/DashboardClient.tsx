"use client";

import { useMemo, useState } from "react";
import {
  STATUSES,
  STATUS_BADGE,
  isFollowUpDue,
  type Application,
  type Status,
} from "@/lib/types";
import { deleteApplication, setStatus } from "@/app/dashboard/actions";
import ApplicationForm from "@/components/ApplicationForm";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100";

type SortKey = "newest" | "oldest" | "company";

function csvCell(value: string | null | undefined): string {
  const v = value ?? "";
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function exportCsv(rows: Application[]) {
  const header = [
    "Company",
    "Role",
    "Location",
    "Work type",
    "Salary",
    "Source",
    "Listing URL",
    "Date applied",
    "Status",
    "Contact",
    "Next step",
    "Next step date",
    "Notes",
  ];
  const lines = rows.map((a) =>
    [
      a.company,
      a.role_title,
      a.location,
      a.work_type,
      a.salary_text,
      a.source,
      a.listing_url,
      a.date_applied,
      a.status,
      a.contact_name,
      a.next_step,
      a.next_step_date,
      a.notes,
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "job-applications.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DashboardClient({ applications }: { applications: Application[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: applications.length };
    for (const s of STATUSES) c[s] = applications.filter((a) => a.status === s).length;
    return c;
  }, [applications]);

  const stats = useMemo(() => {
    const inProgress = applications.filter(
      (a) => a.status === "Screening" || a.status === "Interviewing",
    ).length;
    const offers = applications.filter((a) => a.status === "Offer").length;
    const followUps = applications.filter((a) => isFollowUpDue(a)).length;
    // Response rate: of the applications actually submitted (Applied or later,
    // excluding Saved and Withdrawn), how many got a response past Applied.
    const submitted = applications.filter((a) =>
      ["Applied", "Screening", "Interviewing", "Offer", "Rejected"].includes(a.status),
    ).length;
    const responded = applications.filter((a) =>
      ["Screening", "Interviewing", "Offer"].includes(a.status),
    ).length;
    return {
      total: applications.length,
      inProgress,
      offers,
      followUps,
      responseRate: submitted === 0 ? null : Math.round((responded / submitted) * 100),
    };
  }, [applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = applications.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (!q) return true;
      return `${a.company} ${a.role_title}`.toLowerCase().includes(q);
    });
    const dateKey = (a: Application) => new Date(a.date_applied ?? a.created_at).getTime();
    return [...rows].sort((a, b) => {
      if (sortKey === "company") return a.company.localeCompare(b.company);
      if (sortKey === "oldest") return dateKey(a) - dateKey(b);
      return dateKey(b) - dateKey(a);
    });
  }, [applications, search, statusFilter, sortKey]);

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

  const statCards = [
    { label: "Total applications", value: String(stats.total) },
    { label: "Interviews in progress", value: String(stats.inProgress) },
    { label: "Offers", value: String(stats.offers) },
    { label: "Follow-ups due", value: String(stats.followUps) },
    {
      label: "Response rate",
      value: stats.responseRate === null ? "—" : `${stats.responseRate}%`,
    },
  ];

  return (
    <div>
      {/* Overview stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-2xl font-bold text-indigo-950">{card.value}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Status counts */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              statusFilter === s
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {stats.followUps > 0 && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
          {stats.followUps} application{stats.followUps === 1 ? "" : "s"}{" "}
          {stats.followUps === 1 ? "has" : "have"} a follow-up due.
        </p>
      )}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* Search + sort + export + add */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company or role…"
          className={`${inputClass} min-w-52 flex-1`}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          Sort
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Sort applications"
            className={inputClass}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="company">Company A–Z</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowAdd((v) => !v);
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
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
        <div className="mt-8 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold">No applications yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600">
            Add your first application — company, role, and status are all you need to
            start. Your pipeline, stats, and follow-ups will fill in from there.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowAdd(true);
            }}
            className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add your first application
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-600">No applications match that search or filter.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-indigo-50/60">
              <tr>
                <th className="px-4 py-3 font-semibold text-indigo-950">Company / Role</th>
                <th className="px-4 py-3 font-semibold text-indigo-950">Location</th>
                <th className="px-4 py-3 font-semibold text-indigo-950">Applied</th>
                <th className="px-4 py-3 font-semibold text-indigo-950">Status</th>
                <th className="px-4 py-3 font-semibold text-indigo-950">Next step</th>
                <th className="px-4 py-3 font-semibold text-indigo-950">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                const due = isFollowUpDue(app);
                return (
                  <tr key={app.id} className="border-b border-zinc-100 last:border-0 hover:bg-indigo-50/40">
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
                          className="text-xs font-medium text-indigo-600 underline hover:text-indigo-800"
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
                        className={`rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 focus:outline-none ${STATUS_BADGE[app.status]}`}
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
                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                          Follow-up due
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdd(false);
                            setEditing(app);
                          }}
                          className="font-medium text-indigo-600 underline hover:text-indigo-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app)}
                          className="font-medium text-red-700 underline hover:text-red-900"
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
