import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import SmoothScroll from "@/components/public/SmoothScroll";
import IntroOverlay from "@/components/public/IntroOverlay";
import FloatingContact from "@/components/public/FloatingContact";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: settings.siteName,
    description: settings.aboutText,
    image: new URL("/media/og-image.jpg", process.env.SITE_URL || "http://localhost:3000").toString(),
    ...(settings.shopPhone ? { telephone: settings.shopPhone } : {}),
    ...(settings.shopAddress
      ? { address: { "@type": "PostalAddress", streetAddress: settings.shopAddress, addressLocality: "Vijayawada", addressCountry: "IN" } }
      : {}),
  };

  return (
    // min-h-dvh, not min-h-full: Lenis sets `body { height: auto }`, so a
    // percentage min-height has no definite basis and collapses.
    <div className="flex min-h-dvh flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <IntroOverlay logoUrl="/media/logo/logo-on-light.webp" siteName={settings.siteName} />
      <SmoothScroll />
      <Navbar logoUrl={settings.logoUrl} siteName={settings.siteName} />
      <main className="flex-1">{children}</main>

      {settings.shopPhone && (
        <FloatingContact
          phone={settings.shopPhone}
          siteName={settings.siteName}
          instagramUrl={settings.instagramUrl}
        />
      )}
      <Footer
        logoUrl={settings.logoUrl}
        siteName={settings.siteName}
        tagline={settings.footerTagline}
        address={settings.shopAddress}
        phone={settings.shopPhone}
        instagramUrl={settings.instagramUrl}
      />
    </div>
  );
}
