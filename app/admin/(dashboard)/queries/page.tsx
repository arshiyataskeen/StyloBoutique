"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import StatusBadge from "@/components/admin/StatusBadge";
import { QUERY_STATUSES } from "@/lib/constants";
import type { QueryDTO } from "@/lib/types";

export default function AdminQueriesPage() {
  const [queries, setQueries] = useState<QueryDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    fetch(`/api/admin/queries${params}`)
      .then((r) => r.json())
      .then((d) => setQueries(d.queries ?? []));
  }, [statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl sm:text-3xl">Queries</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-base sm:text-sm"
        >
          <option value="">All statuses</option>
          {QUERY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-background text-left text-muted">
            <tr>
              <th className="px-5 py-3 font-normal">Ref Code</th>
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">Message</th>
              <th className="px-5 py-3 font-normal">Received</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((q) => (
              <tr key={q.id} className="border-t border-border">
                <td className="px-5 py-3">
                  <Link href={`/admin/queries/${q.id}`} className="font-mono text-accent">
                    {q.refCode}
                  </Link>
                </td>
                <td className="px-5 py-3">{q.name}</td>
                <td className="px-5 py-3 max-w-xs truncate text-muted">{q.message}</td>
                <td className="px-5 py-3 text-muted">{format(new Date(q.createdAt), "d MMM yyyy")}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={q.status} />
                </td>
              </tr>
            ))}
            {queries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  No queries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
