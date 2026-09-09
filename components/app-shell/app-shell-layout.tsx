"use client";

import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { AppTopbar } from "@/components/app-shell/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { AdvisorSession } from "@/lib/dal";
import type { DemoAlert } from "@/lib/demo/types";

type AppShellLayoutProps = {
  session: AdvisorSession;
  alerts: DemoAlert[];
  children: React.ReactNode;
};

export function AppShellLayout({
  session,
  alerts,
  children,
}: AppShellLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar capabilities={session.capabilities} />
      <SidebarInset
        className={`flex min-h-svh flex-col ${dashboardTheme.surface}`}
      >
        <AppTopbar session={session} alerts={alerts} />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
