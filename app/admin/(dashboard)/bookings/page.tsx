"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { BOOKING_STATUSES, formatStatusLabel } from "@/lib/constants";
import { waLink } from "@/lib/whatsapp";
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
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-background text-left text-muted">
            <tr>
              <th className="px-5 py-3 font-normal">Ref Code</th>
              <th className="px-5 py-3 font-normal">Customer</th>
              <th className="px-5 py-3 font-normal">Phone</th>
              <th className="px-5 py-3 font-normal">Booked</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              // Opens WhatsApp on the customer's number with nothing written —
              // for a quick word. The composed status update lives on the
              // detail page, where the status and notes are to hand.
              const chat = waLink(b.phone, "");
              return (
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
                  <td className="px-5 py-3">
                    {/* The ref code was already a link, but a code does not
                        look like a button — this says what it does. */}
                    <div className="flex items-center justify-end gap-2">
                      {chat && (
                        <a
                          href={chat}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`WhatsApp ${b.customerName}`}
                          aria-label={`WhatsApp ${b.customerName}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#128C4A] transition-colors hover:bg-[#25D366]/20"
                        >
                          <MessageCircle className="h-4 w-4" strokeWidth={2} />
                        </a>
                      )}
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:border-accent hover:text-accent"
                      >
                        View / Update
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
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
