"use client";

import type { ReactNode } from "react";
import type { AdvisorSession } from "@/lib/dal";
import { AppSidebar } from "@/components/dashboard-shell/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard-shell/dashboard-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardShellProps = {
  advisor: AdvisorSession;
  children: ReactNode;
};

export function DashboardShell({ advisor, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar advisor={advisor} />
      <SidebarInset className="dashboard-surface">
        <DashboardTopbar />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
