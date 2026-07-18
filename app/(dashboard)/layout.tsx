import { requireSession } from "@/lib/dal";
import { DashboardShell } from "@/components/dashboard-shell/dashboard-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const advisor = await requireSession();

  return <DashboardShell advisor={advisor}>{children}</DashboardShell>;
}
