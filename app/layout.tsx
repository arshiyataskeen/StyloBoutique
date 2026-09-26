import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const OG_IMAGE = "/media/og-image.jpg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the page paint behind the notch and home indicator; the fixed contact
  // button then pads itself back out with env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: "#faf7f2",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  // Browser tab shows the brand alone; the descriptive version is kept for link
  // previews and search, where the extra context actually helps.
  const title = settings.siteName;
  const shareTitle = `${settings.siteName} — Boutique & Tailoring in Vijayawada`;
  const description = `${settings.siteName} — custom blouses, suits, bridal wear and kids wear in Vijayawada. Embroidery, maggam work and stitching, all under one roof. ${settings.heroSubheading}`;

  return {
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title: { default: title, template: `%s · ${settings.siteName}` },
    description,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: settings.siteName,
      title: shareTitle,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: settings.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
