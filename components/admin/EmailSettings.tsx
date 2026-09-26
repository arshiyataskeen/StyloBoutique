"use client";

import { useState } from "react";
import { Send, Loader2, ShieldCheck } from "lucide-react";

const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent";

export default function EmailSettings({
  notifyEmail,
  smtpUser,
  smtpPass,
  smtpConfigured,
  onChange,
}: {
  notifyEmail: string;
  smtpUser: string;
  smtpPass: string;
  /** True when a password is already saved — we never load the value itself. */
  smtpConfigured: boolean;
  onChange: (patch: { notifyEmail?: string; smtpUser?: string; smtpPass?: string }) => void;
}) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function sendTest() {
    setSending(true);
    setResult(null);

    const res = await fetch("/api/admin/notify-test", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    setSending(false);
    setResult(
      res.ok
        ? { ok: true, message: `Sent to ${data.to} — check the inbox.` }
        : { ok: false, message: data.error ?? "Could not send." }
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm">Send alerts to</label>
        <input
          type="email"
          value={notifyEmail}
          onChange={(e) => onChange({ notifyEmail: e.target.value })}
          placeholder="owner@example.com"
          className={input}
        />
        <p className="mt-1 text-xs text-muted">
          Where new bookings and enquiries are emailed. Leave empty to turn alerts off.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm">Send from (Gmail)</label>
        <input
          type="email"
          value={smtpUser}
          onChange={(e) => onChange({ smtpUser: e.target.value })}
          placeholder="your.shop@gmail.com"
          className={input}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">
          Gmail App Password
          {smtpConfigured && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-700">
              <ShieldCheck className="h-3.5 w-3.5" /> saved
            </span>
          )}
        </label>
        <input
          type="password"
          value={smtpPass}
          onChange={(e) => onChange({ smtpPass: e.target.value })}
          placeholder={smtpConfigured ? "•••••••••••••••• (leave blank to keep)" : "16-character app password"}
          autoComplete="new-password"
          className={input}
        />
        <p className="mt-1 text-xs text-muted">
          Not your Gmail login password. Create one at Google Account → Security → 2-Step
          Verification → App passwords. For security the saved password is never shown again —
          leave this blank to keep it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={sendTest}
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send test email
        </button>
        <span className="text-xs text-muted">Save your changes first.</span>
      </div>

      {result && (
        <p className={`text-xs ${result.ok ? "text-green-700" : "text-red-600"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
