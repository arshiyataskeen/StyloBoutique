"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { isPriceHidden, priceLabel } from "@/lib/pricing";
import { bookingCodeMessage, waLink } from "@/lib/whatsapp";
import type { CategoryDTO, ModelDTO } from "@/lib/types";

type FormValues = {
  customerName: string;
  phone: string;
  email: string;
  categoryId: string;
  modelId: string;
  measurementsOrNotes: string;
  preferredDate: string;
};

export default function BookingForm({
  preselected,
  shopWhatsapp,
  siteName = "Stylo Ladies Botique",
}: {
  preselected?: ModelDTO | null;
  /** The shop's WhatsApp number, for the "save your code" button on success. */
  shopWhatsapp?: string | null;
  siteName?: string;
}) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [models, setModels] = useState<ModelDTO[]>([]);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Lets the customer drop the pre-filled design and pick another instead.
  const [locked, setLocked] = useState(Boolean(preselected));

  const preselectedCategory =
    preselected && typeof preselected.category !== "string" ? preselected.category : null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      modelId: preselected?.id ?? "",
      categoryId: preselectedCategory?.id ?? "",
    },
  });

  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []));
  }, []);

  const filteredModels = selectedCategoryId
    ? models.filter((m) => {
        const catId = typeof m.category === "string" ? m.category : m.category.id;
        return catId === selectedCategoryId;
      })
    : models;

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const res = await fetch("/api/bookings", {
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
    // Kept so the success screen can put the whole booking into the WhatsApp
    // message, rather than just the code.
    setSubmitted(values);
    setRefCode(data.refCode);
  }

  if (refCode) {
    // What they actually booked — the pre-filled design, or whatever they
    // picked from the lists. Named so the shop's WhatsApp says "Puff Sleeve
    // Blouse" rather than an id.
    const bookedName =
      preselected?.name ??
      models.find((m) => m.id === submitted?.modelId)?.name ??
      categories.find((c) => c.id === submitted?.categoryId)?.name ??
      null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-10"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" strokeWidth={1.5} />
        <h2 className="mt-4 font-serif text-2xl">Booking received!</h2>
        {preselected && locked && (
          <p className="mt-1 text-sm text-muted">
            for <span className="text-foreground">{preselected.name}</span>
          </p>
        )}
        <p className="mt-2 text-muted">Save this reference code to track your order:</p>
        <p className="mt-4 rounded-lg bg-background px-4 py-3 font-mono text-xl tracking-widest text-accent sm:px-6 sm:text-2xl">
          {refCode}
        </p>

        {/*
          Sends the code to the shop from the customer's own WhatsApp.
          The site cannot message them — that needs the paid Business API — but
          one tap here puts the code in their chat history with the shop, which
          is where they will actually go looking for it. It opens their app
          with the message written; they press send.
        */}
        {shopWhatsapp && (
          <a
            href={
              waLink(
                shopWhatsapp,
                bookingCodeMessage({
                  siteName,
                  refCode,
                  customerName: submitted?.customerName,
                  phone: submitted?.phone,
                  designName: bookedName,
                  preferredDate: submitted?.preferredDate,
                  notes: submitted?.measurementsOrNotes,
                })
              ) ?? undefined
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            Save this code on WhatsApp
          </a>
        )}

        <p className="mt-4 text-sm text-muted">
          We&apos;ll reach out on the phone number you provided. You can check your status anytime
          on the Track Order page.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {preselected && locked && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.15em] text-accent">You&apos;re booking</p>
            <button
              type="button"
              onClick={() => {
                setLocked(false);
                setValue("modelId", "");
                setValue("categoryId", "");
              }}
              className="shrink-0 text-xs text-muted underline underline-offset-2 hover:text-accent"
            >
              Change
            </button>
          </div>

          <div className="mt-3 flex gap-4">
            {preselected.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preselected.images[0]}
                alt=""
                className="h-24 w-20 shrink-0 rounded-lg border border-border object-cover sm:h-28 sm:w-24"
              />
            )}
            <div className="min-w-0">
              <h2 className="font-serif text-lg leading-snug">{preselected.name}</h2>
              {preselectedCategory && (
                <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-muted">
                  {preselectedCategory.name}
                </p>
              )}
              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                <span
                  className={
                    isPriceHidden(preselected.priceDisplay)
                      ? "text-sm text-muted"
                      : "font-medium text-accent"
                  }
                >
                  {priceLabel(preselected.price, preselected.priceDisplay)}
                </span>
                {!isPriceHidden(preselected.priceDisplay) && preselected.priceNote && (
                  <span className="text-xs text-muted">{preselected.priceNote}</span>
                )}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                {preselected.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Full name</label>
          <input
            {...register("customerName", { required: "Name is required" })}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
          />
          {errors.customerName && (
            <p className="mt-1 text-xs text-red-600">{errors.customerName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm">Phone number</label>
          <input
            {...register("phone", { required: "Phone number is required" })}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
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

      {/* Hidden once a design is carried over from the catalog — those are
          exactly the details we already know. "Change" brings them back. */}
      <div className={locked ? "hidden" : "grid gap-5 sm:grid-cols-2"}>
        <div>
          <label className="mb-1 block text-sm">Category</label>
          <select
            {...register("categoryId")}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
          >
            <option value="">Any category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm">Design (optional)</label>
          <select
            {...register("modelId")}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
          >
            <option value="">Not sure yet</option>
            {filteredModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm">Preferred date (optional)</label>
        <input
          type="date"
          {...register("preferredDate")}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Measurements / notes (optional)</label>
        <textarea
          rows={4}
          {...register("measurementsOrNotes")}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent"
          placeholder={
            preselected && locked
              ? `Any changes to the ${preselected.name} — measurements, fabric, sleeve length…`
              : "Add any measurements, fabric preferences, or notes for the tailor"
          }
        />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-foreground px-6 py-3 text-sm text-background transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {isSubmitting
          ? "Submitting..."
          : preselected && locked
            ? `Book ${preselected.name}`
            : "Submit Booking"}
      </button>
    </form>
  );
}
