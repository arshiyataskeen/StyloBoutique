import AdminSidebar from "@/components/admin/AdminSidebar";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    // Stacked on phones and tablets (menu bar on top), side by side from lg up.
    // min-w-0 lets wide children such as tables shrink instead of pushing the
    // whole page sideways.
    <div className="min-h-dvh bg-background lg:flex">
      <AdminSidebar logoUrl={settings.logoUrl} siteName={settings.siteName} />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
    </div>
  );
}
