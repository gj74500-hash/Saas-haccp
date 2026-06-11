import { requireUser } from "@/lib/auth/guards";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-60">
        <Topbar user={user} />
        {/* Bottom padding clears the mobile tab bar */}
        <main className="px-4 py-6 pb-24 sm:px-6 lg:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
