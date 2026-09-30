"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { BOOKING_STATUSES, formatStatusLabel } from "@/lib/constants";
import { statusUpdateMessage, waLink } from "@/lib/whatsapp";
import type { BookingDTO } from "@/lib/types";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDTO | null>(null);
  const [siteName, setSiteName] = useState("Stylo Ladies Botique");
  // Empty until after mount. Reading window.location during render would make
  // the server's href and the client's disagree, which is a hydration mismatch;
  // starting empty means both render the same thing and it fills in after.
  const [origin, setOrigin] = useState("");
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
    // The shop's own name goes into the WhatsApp message, so it reads as the
    // shop writing rather than an anonymous "your order".
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        if (data.settings?.siteName) setSiteName(data.settings.siteName);
        setOrigin(window.location.origin);
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

  /**
   * Saves the note first, then opens WhatsApp with it written out.
   *
   * Opened from the click itself rather than after the await: a browser only
   * allows window.open during a gesture, and by the time the PATCH comes back
   * the gesture is over and the popup is blocked. So the tab is claimed up
   * front and pointed at the link once the save lands.
   */
  async function addNoteAndWhatsApp(e: React.MouseEvent) {
    e.preventDefault();
    const text = note.trim();
    if (!text || !booking) return;

    const tab = window.open("", "_blank");
    setSaving(true);
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: text }),
    });
    setNote("");
    setSaving(false);

    const link = waLink(
      booking.phone,
      statusUpdateMessage({
        siteName,
        customerName: booking.customerName,
        refCode: booking.refCode,
        status: booking.status,
        note: text,
        trackUrl: origin ? `${origin}/track` : null,
      })
    );

    if (tab && link) tab.location.href = link;
    else tab?.close();
    load();
  }

  if (!booking) return <p className="text-muted">Loading...</p>;

  const latestNote = booking.adminNotes.at(-1)?.note ?? null;
  const statusLink = waLink(
    booking.phone,
    statusUpdateMessage({
      siteName,
      customerName: booking.customerName,
      refCode: booking.refCode,
      status: booking.status,
      note: latestNote,
      trackUrl: origin ? `${origin}/track` : null,
    })
  );

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

        {/*
          WhatsApp cannot be sent by the site — that needs the paid Business
          API — so this hands the shop a message already written and lets them
          press send. The customer's email goes out on its own; this is for the
          number, which is the one thing every customer gives.
        */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {statusLink ? (
            <a
              href={statusLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              Send this update on WhatsApp
            </a>
          ) : (
            <p className="text-xs text-muted">
              No usable WhatsApp number on this booking.
            </p>
          )}
          <p className="text-xs text-muted">
            {booking.email
              ? `Emailed to ${booking.email} automatically.`
              : "No email on this booking — WhatsApp or a call is the only way to reach them."}
          </p>
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

        <form onSubmit={addNote} className="mt-4">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an update for the customer..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || !note.trim()}
              className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
            >
              Add update
            </button>
            {/* Saves it and hands the same words to WhatsApp, so the shop does
                not have to type the update twice. */}
            <button
              type="button"
              onClick={addNoteAndWhatsApp}
              disabled={saving || !note.trim() || !waLink(booking.phone, "")}
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              Add &amp; send on WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
