"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquarePlus,
  X,
  Loader2,
  CheckCircle2,
  Angry,
  Frown,
  Meh,
  Smile,
  Laugh,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The 1–5 scale, as faces. Stored as the same number a star rating would be. */
const FACES = [
  { value: 1, Icon: Angry, label: "Not happy" },
  { value: 2, Icon: Frown, label: "Could be better" },
  { value: 3, Icon: Meh, label: "Fine" },
  { value: 4, Icon: Smile, label: "Happy" },
  { value: 5, Icon: Laugh, label: "Delighted" },
] as const;

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent";

export default function FeedbackButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message, rating }),
    });

    setSending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not send. Please try again.");
      return;
    }

    setDone(true);
    setName("");
    setMessage("");
  }

  function close() {
    setOpen(false);
    // Reset after the exit animation, so the form does not flicker on the way out.
    setTimeout(() => {
      setDone(false);
      setError(null);
    }, 300);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-transform hover:scale-105 active:scale-95"
        }
      >
        <MessageSquarePlus className="h-4 w-4" />
        Leave feedback
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
              role="dialog"
              aria-modal="true"
              aria-label="Leave feedback"
              // Scrolls internally rather than running off a short screen once
              // the on-screen keyboard is up.
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-6"
              data-lenis-prevent
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {done ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" strokeWidth={1.5} />
                  <h2 className="mt-3 font-serif text-xl">Thank you</h2>
                  <p className="mt-2 text-sm text-muted">
                    We&apos;ve received your feedback. It appears on the site once we&apos;ve read it.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-5 rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <h2 className="font-serif text-xl">Leave feedback</h2>
                  <p className="mt-1 text-sm text-muted">
                    Tell us how your garment turned out.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm">Your name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={60}
                        className={field}
                      />
                    </div>

                    {/*
                      Faces rather than five identical stars. Picking a star
                      means counting them; a face is recognised at a glance,
                      and the word under it removes any doubt about what four
                      out of five was meant to mean.
                    */}
                    <div>
                      <span className="mb-2 block text-sm">How did it turn out?</span>
                      <div className="flex justify-between gap-1.5">
                        {FACES.map(({ value, Icon, label }) => {
                          const picked = rating === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setRating(value)}
                              aria-label={label}
                              aria-pressed={picked}
                              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-2.5 transition-all ${
                                picked
                                  ? "border-accent bg-accent/10"
                                  : "border-transparent hover:border-border hover:bg-background"
                              }`}
                            >
                              <motion.span
                                animate={picked ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                              >
                                <Icon
                                  className={`h-7 w-7 transition-colors ${
                                    picked ? "text-accent" : "text-muted/60"
                                  }`}
                                  strokeWidth={1.75}
                                />
                              </motion.span>
                              <span
                                className={`text-[10px] leading-tight transition-colors ${
                                  picked ? "font-medium text-accent" : "text-muted"
                                }`}
                              >
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm">Your feedback</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        minLength={10}
                        maxLength={1000}
                        rows={4}
                        className={field}
                      />
                    </div>
                  </div>

                  {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background disabled:opacity-60"
                  >
                    {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {sending ? "Sending…" : "Send feedback"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
