import Link from "next/link";
import { format } from "date-fns";
import { AlertCircle, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

async function getData() {
  const [
    categories,
    models,
    pendingBookings,
    totalBookings,
    newQueries,
    modelsWithoutPhoto,
    recentBookings,
    recentQueries,
    settings,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.model.count(),
    prisma.booking.count({ where: { status: "Pending" } }),
    prisma.booking.count(),
    prisma.query.count({ where: { status: "New" } }),
    prisma.model.count({ where: { images: { isEmpty: true } } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, refCode: true, customerName: true, status: true, createdAt: true },
    }),
    prisma.query.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, refCode: true, name: true, status: true, createdAt: true },
    }),
    getSiteSettings(),
  ]);

  return {
    categories,
    models,
    pendingBookings,
    totalBookings,
    newQueries,
    modelsWithoutPhoto,
    recentBookings,
    recentQueries,
    settings,
  };
}

export default async function AdminDashboardPage() {
  const d = await getData();

  const cards = [
    { label: "Categories", value: d.categories, href: "/admin/categories" },
    { label: "Designs", value: d.models, href: "/admin/models" },
    { label: "Pending Bookings", value: d.pendingBookings, href: "/admin/bookings" },
    { label: "Total Bookings", value: d.totalBookings, href: "/admin/bookings" },
    { label: "New Queries", value: d.newQueries, href: "/admin/queries" },
  ];

  const todo = [
    {
      done: Boolean(d.settings.shopPhone),
      label: "Add your phone number",
      hint: "Turns on the WhatsApp and Call buttons on the website",
      href: "/admin/settings",
    },
    {
      done: d.modelsWithoutPhoto === 0 && d.models > 0,
      label:
        d.models === 0
          ? "Add your first design"
          : `Add photos to ${d.modelsWithoutPhoto} design${d.modelsWithoutPhoto === 1 ? "" : "s"}`,
      hint: "Designs without photos show a placeholder on the website",
      href: "/admin/models",
    },
    {
      done: d.settings.galleryImages.length >= 4,
      label: "Fill the Our Story gallery",
      hint: "Photos of your shop, your team and work in progress",
      href: "/admin/settings",
    },
  ];

  const outstanding = todo.filter((t) => !t.done);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl sm:text-3xl">Dashboard</h1>
        <Link
          href="/admin/models/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Add design
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-md sm:p-5"
          >
            <p className="font-serif text-2xl text-accent sm:text-3xl">{c.value}</p>
            <p className="mt-1 text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-serif text-xl">Set-up</h2>
        {outstanding.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Everything is set up — your website is ready for customers.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {outstanding.map((t) => (
              <li key={t.label}>
                <Link
                  href={t.href}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{t.hint}</span>
                  </span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPanel
          title="Recent bookings"
          href="/admin/bookings"
          empty="No bookings yet."
          rows={d.recentBookings.map((b) => ({
            id: b.id,
            href: `/admin/bookings/${b.id}`,
            primary: b.customerName,
            secondary: b.refCode,
            status: b.status,
            date: b.createdAt,
          }))}
        />
        <RecentPanel
          title="Recent enquiries"
          href="/admin/queries"
          empty="No enquiries yet."
          rows={d.recentQueries.map((q) => ({
            id: q.id,
            href: `/admin/queries/${q.id}`,
            primary: q.name,
            secondary: q.refCode,
            status: q.status,
            date: q.createdAt,
          }))}
        />
      </div>
    </div>
  );
}

function RecentPanel({
  title,
  href,
  empty,
  rows,
}: {
  title: string;
  href: string;
  empty: string;
  rows: {
    id: string;
    href: string;
    primary: string;
    secondary: string;
    status: string;
    date: Date;
  }[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">{title}</h2>
        <Link href={href} className="text-sm text-accent hover:underline">
          View all
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={r.href} className="flex items-center gap-3 py-3 hover:text-accent">
                <span className="flex-1">
                  <span className="block text-sm font-medium">{r.primary}</span>
                  <span className="text-xs text-muted">
                    {r.secondary} · {format(new Date(r.date), "d MMM yyyy")}
                  </span>
                </span>
                <StatusBadge status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
