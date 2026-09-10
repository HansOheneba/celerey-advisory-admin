"use client";

import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { AppTopbar } from "@/components/app-shell/app-topbar";
import { dashboardContentFrameClass } from "@/components/app-shell/dashboard-content-frame";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
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
      <SidebarInset className="flex min-h-svh flex-col bg-background">
        <AppTopbar session={session} alerts={alerts} />
        <main className="flex min-h-0 flex-1 flex-col">
          <div
            className={cn(
              dashboardContentFrameClass,
              "flex flex-1 flex-col py-5 md:py-5 lg:py-8",
            )}
          >
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
