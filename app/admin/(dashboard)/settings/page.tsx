"use client";

import { useEffect, useState } from "react";
import MediaUploader from "@/components/admin/MediaUploader";
import ImageUploader from "@/components/admin/ImageUploader";
import HomeLayoutEditor from "@/components/admin/HomeLayoutEditor";
import StatsEditor from "@/components/admin/StatsEditor";
import SectionCopyEditor from "@/components/admin/SectionCopyEditor";
import EmailSettings from "@/components/admin/EmailSettings";
import { resolveSectionContent, resolveStats } from "@/lib/home-sections";
import type { SiteSettingsDTO } from "@/lib/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setSettings(data.settings);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError(null);
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!settings) return <p className="text-muted">Loading...</p>;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-serif text-2xl sm:text-3xl">Site Content</h1>
      <p className="mt-1 text-sm text-muted">
        Change the logo, homepage video/image, and text shown to visitors — no code changes needed.
      </p>

      <form onSubmit={handleSave} className="mt-6">
        {/* One full-width column of panels. Side-by-side panels can never be
            equal height, so any two-column arrangement leaves a hole; instead
            each panel spans the width and lays its own fields out across it. */}
        <div className="space-y-6">
        {/* Short panels share a row; the tall ones take the full width. */}
        <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">Branding</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm">Logo</label>
              <MediaUploader
                kind="site-image"
                accept="image/png,image/jpeg,image/webp"
                value={settings.logoUrl ?? ""}
                onChange={(url) => setSettings({ ...settings, logoUrl: url })}
                fit="contain"
                compact
              />
              <p className="mt-1 text-xs text-muted">
                Shown in the site header and footer. Leave empty to fall back to the default mark.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm">Site name</label>
              <input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">Footer</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm">Footer tagline</label>
              <input
                value={settings.footerTagline}
                onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Shop address</label>
              <input
                value={settings.shopAddress ?? ""}
                onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                placeholder="e.g. Pindi Mara, Beside Cement Road, 4 Pillars, Vijayawada"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-muted">
                Shown in the footer with a &quot;Get Directions&quot; link to Google Maps.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm">
                Shop phone <span className="text-accent">*</span>
              </label>
              <input
                value={settings.shopPhone ?? ""}
                onChange={(e) => setSettings({ ...settings, shopPhone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-muted">
                Shown in the footer and used by the &quot;Call us&quot; button.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm">
                WhatsApp number <span className="text-accent">*</span>
              </label>
              <input
                value={settings.whatsappNumber ?? ""}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="e.g. +91 91234 56780"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-muted">
                Where WhatsApp messages go — including every &quot;Ask price&quot; button. Can be a
                different line from the shop phone above. A 10-digit Indian number gets +91 added
                automatically.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm">
                Instagram <span className="text-accent">*</span>
              </label>
              <input
                value={settings.instagramUrl ?? ""}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="@yourshop"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-muted">
                Just your handle is enough — a full profile link works too. Adds an Instagram
                section to the homepage plus your handle in the footer, on the Contact page and in
                the floating contact menu.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">Email alerts</h2>
          <p className="mt-1 text-sm text-muted">
            Get an email the moment someone books a fitting or sends an enquiry.
          </p>
          <div className="mt-4">
            <EmailSettings
              notifyEmail={settings.notifyEmail ?? ""}
              smtpUser={settings.smtpUser ?? ""}
              smtpPass={settings.smtpPass ?? ""}
              smtpConfigured={Boolean(settings.smtpConfigured)}
              onChange={(patch) => setSettings({ ...settings, ...patch })}
            />
          </div>
        </section>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">Homepage Hero</h2>
          <div className="mt-4 grid items-start gap-6 md:grid-cols-2">
            <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">Background type</label>
              <div className="flex gap-2">
                {(["Video", "Image"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSettings({ ...settings, heroMediaType: type })}
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      settings.heroMediaType === type
                        ? "border-accent text-accent"
                        : "border-border text-muted"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {settings.heroMediaType === "Video" ? (
              <>
                <div>
                  <label className="mb-1 block text-sm">Background video</label>
                  <MediaUploader
                    kind="site-video"
                    accept="video/mp4,video/webm"
                    value={settings.heroVideoUrl ?? ""}
                    onChange={(url) => setSettings({ ...settings, heroVideoUrl: url })}
                    previewType="video"
                  />
                  <p className="mt-1 text-xs text-muted">MP4 or WebM, up to 30MB. Muted and looped automatically.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Poster image (shown while video loads)</label>
                  <MediaUploader
                    kind="site-image"
                    accept="image/png,image/jpeg,image/webp"
                    value={settings.heroPosterUrl ?? ""}
                    onChange={(url) => setSettings({ ...settings, heroPosterUrl: url })}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1 block text-sm">Background image</label>
                <MediaUploader
                  kind="site-image"
                  accept="image/png,image/jpeg,image/webp"
                  value={settings.heroImageUrl ?? ""}
                  onChange={(url) => setSettings({ ...settings, heroImageUrl: url })}
                />
              </div>
            )}
            </div>

            <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">Small tagline</label>
              <input
                value={settings.heroTagline}
                onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Heading</label>
              <input
                value={settings.heroHeading}
                onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Subheading</label>
              <textarea
                rows={3}
                value={settings.heroSubheading}
                onChange={(e) => setSettings({ ...settings, heroSubheading: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">About Us (Homepage)</h2>
          <p className="mt-1 text-sm text-muted">
            Shown on the homepage as an &quot;About Us&quot; section with a photo gallery.
          </p>
          <div className="mt-4 grid items-start gap-6 md:grid-cols-2">
            <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">Heading</label>
              <input
                value={settings.aboutHeading}
                onChange={(e) => setSettings({ ...settings, aboutHeading: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Story</label>
              <textarea
                rows={6}
                value={settings.aboutText}
                onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </div>
            </div>
            <div>
              <label className="mb-1 block text-sm">Gallery photos</label>
              <ImageUploader
                images={settings.galleryImages}
                onChange={(galleryImages) => setSettings({ ...settings, galleryImages })}
              />
              <p className="mt-1 text-xs text-muted">
                Shown as a photo gallery under the About Us story. Add a few — the shop, the team, work in progress.
              </p>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">Homepage layout</h2>
          <p className="mt-1 text-sm text-muted">
            Decide which sections appear on the homepage and in what order.
          </p>
          <div className="mt-4">
            <HomeLayoutEditor
              value={settings.homeSections}
              onChange={(homeSections) => setSettings({ ...settings, homeSections })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">Numbers</h2>
          <p className="mt-1 text-sm text-muted">
            Years of experience, garments tailored and anything else worth showing off.
          </p>
          <div className="mt-4">
            <StatsEditor
              value={resolveStats(settings.stats)}
              onChange={(stats) => setSettings({ ...settings, stats })}
            />
          </div>
        </section>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl">Homepage wording</h2>
          <p className="mt-1 text-sm text-muted">
            Headings and card text for every homepage section.
          </p>
          <div className="mt-4">
            <SectionCopyEditor
              value={resolveSectionContent(settings.sectionContent)}
              onChange={(sectionContent) => setSettings({ ...settings, sectionContent })}
            />
          </div>
        </section>
        </div>

        <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-4 border-t border-border bg-background/85 py-4 backdrop-blur">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && !error && <p className="text-sm text-green-700">Your website has been updated.</p>}
        </div>
      </form>
    </div>
  );
}
