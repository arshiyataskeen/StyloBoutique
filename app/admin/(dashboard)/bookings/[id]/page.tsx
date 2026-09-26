"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import StatusBadge from "@/components/admin/StatusBadge";
import { BOOKING_STATUSES, formatStatusLabel } from "@/lib/constants";
import type { BookingDTO } from "@/lib/types";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDTO | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/bookings/${id}`);
    const data = await res.json();
    setBooking(data.booking);
  }

  useEffect(() => {
    let ignore = false;
    fetch(`/api/admin/bookings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setBooking(data.booking);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  async function updateStatus(status: string) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setNote("");
    setSaving(false);
    load();
  }

  if (!booking) return <p className="text-muted">Loading...</p>;

  const modelName = booking.model && typeof booking.model !== "string" ? booking.model.name : null;
  const categoryName = booking.category && typeof booking.category !== "string" ? booking.category.name : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl sm:text-3xl">{booking.refCode}</h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-5 text-sm sm:grid-cols-2 sm:p-6">
        <div>
          <p className="text-muted">Customer</p>
          <p>{booking.customerName}</p>
        </div>
        <div>
          <p className="text-muted">Phone</p>
          <p>{booking.phone}</p>
        </div>
        {booking.email && (
          <div>
            <p className="text-muted">Email</p>
            <p>{booking.email}</p>
          </div>
        )}
        {(modelName || categoryName) && (
          <div>
            <p className="text-muted">Design</p>
            <p>{modelName ?? categoryName}</p>
          </div>
        )}
        {booking.preferredDate && (
          <div>
            <p className="text-muted">Preferred date</p>
            <p>{format(new Date(booking.preferredDate), "d MMM yyyy")}</p>
          </div>
        )}
        <div>
          <p className="text-muted">Booked on</p>
          <p>{format(new Date(booking.createdAt), "d MMM yyyy, h:mm a")}</p>
        </div>
        {booking.measurementsOrNotes && (
          <div className="col-span-2">
            <p className="text-muted">Measurements / notes</p>
            <p>{booking.measurementsOrNotes}</p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <p className="mb-2 text-sm text-muted">Update status</p>
        <div className="flex flex-wrap gap-2">
          {BOOKING_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                booking.status === s ? "border-accent text-accent" : "border-border text-muted"
              }`}
            >
              {formatStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <p className="mb-3 text-sm text-muted">Updates / notes visible to the customer</p>
        <div className="space-y-3">
          {booking.adminNotes.map((n, i) => (
            <div key={i} className="border-t border-border pt-3 text-sm first:border-t-0 first:pt-0">
              <span className="text-muted">{format(new Date(n.createdAt), "d MMM, h:mm a")} — </span>
              {n.note}
            </div>
          ))}
          {booking.adminNotes.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
        </div>

        <form onSubmit={addNote} className="mt-4 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an update for the customer..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
