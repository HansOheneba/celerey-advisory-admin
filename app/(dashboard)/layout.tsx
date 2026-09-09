import { AppShell } from "@/components/app-shell/app-shell";
import { requireSession } from "@/lib/dal";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();

  return <AppShell session={session}>{children}</AppShell>;
}
