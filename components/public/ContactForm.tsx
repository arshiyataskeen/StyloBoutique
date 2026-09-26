"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type FormValues = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export default function ContactForm({ about }: { about?: string }) {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // Arrives pre-written when the visitor came from a design's "Send a
    // message" link, so they only have to add their name.
    defaultValues: {
      message: about ? `Hi, could you tell me the price for "${about}"?` : "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const res = await fetch("/api/queries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    const data = await res.json();
    setRefCode(data.refCode);
  }

  if (refCode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border bg-surface p-10 text-center"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" strokeWidth={1.5} />
        <h2 className="mt-4 font-serif text-2xl">Message sent!</h2>
        <p className="mt-2 text-muted">We&apos;ll get back to you soon.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Full name</label>
          <input
            {...register("name", { required: "Name is required" })}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm">Phone (optional)</label>
          <input
            {...register("phone")}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm">Email (optional)</label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Message</label>
        <textarea
          rows={5}
          // Also set here, not just in defaultValues, so the pre-written text is
          // in the server-rendered HTML rather than appearing after hydration.
          defaultValue={about ? `Hi, could you tell me the price for "${about}"?` : undefined}
          {...register("message", { required: "Message is required" })}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-foreground px-6 py-3 text-sm text-background transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
