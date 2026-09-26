"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import StatusBadge from "@/components/admin/StatusBadge";
import { BOOKING_STATUSES, formatStatusLabel } from "@/lib/constants";
import type { BookingDTO } from "@/lib/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    fetch(`/api/admin/bookings${params}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []));
  }, [statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl sm:text-3xl">Bookings</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-base sm:text-sm"
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {formatStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Scrolls sideways on a phone rather than squeezing five columns into
          360px — the row stays readable and the page itself never shifts. */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-background text-left text-muted">
            <tr>
              <th className="px-5 py-3 font-normal">Ref Code</th>
              <th className="px-5 py-3 font-normal">Customer</th>
              <th className="px-5 py-3 font-normal">Phone</th>
              <th className="px-5 py-3 font-normal">Booked</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-5 py-3">
                  <Link href={`/admin/bookings/${b.id}`} className="font-mono text-accent">
                    {b.refCode}
                  </Link>
                </td>
                <td className="px-5 py-3">{b.customerName}</td>
                <td className="px-5 py-3 text-muted">{b.phone}</td>
                <td className="px-5 py-3 text-muted">{format(new Date(b.createdAt), "d MMM yyyy")}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
