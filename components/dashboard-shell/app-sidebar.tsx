"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  CalendarClock,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Settings,
  UserRoundCog,
  Users,
} from "lucide-react";
import { isAdmin } from "@/lib/auth/roles";
import type { AdvisorSession } from "@/lib/dal";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

function getPrimaryNav(admin: boolean) {
  return [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Clients", href: "/clients", icon: Users },
    ...(admin
      ? [
          { title: "Advisors", href: "/advisors", icon: UserRoundCog },
          { title: "Assignments", href: "/assignments", icon: ArrowLeftRight },
        ]
      : []),
    { title: "Messages", href: "/messages", icon: MessageSquareText },
    { title: "Appointments", href: "/appointments", icon: CalendarClock },
    { title: "Tasks", href: "/tasks", icon: ListChecks },
    { title: "Reports", href: "/reports", icon: BarChart3 },
  ];
}

type AppSidebarProps = {
  advisor: AdvisorSession;
};

export function AppSidebar({ advisor }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const showSymbol = !isMobile && state === "collapsed";
  const primaryNav = getPrimaryNav(isAdmin(advisor.role));
  const settingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-12 shrink-0 items-center justify-center border-b border-sidebar-border px-2">
        <Link
          href="/dashboard"
          className="flex size-full items-center justify-center transition-opacity duration-[var(--duration-press)] ease-[var(--ease-out)] hover:opacity-90 active:scale-[0.97]"
          aria-label="Celerey home"
        >
          {showSymbol ? (
            <Image
              src="/logos/CelereySymbolLight.png"
              alt="Celerey"
              width={32}
              height={32}
              className="size-7 object-contain"
              priority
            />
          ) : (
            <Image
              src="/logos/logoWhite.png"
              alt="Celerey"
              width={150}
              height={38}
              className="h-7 w-auto"
              priority
            />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={settingsActive}
              tooltip="Settings"
              render={<Link href="/settings" />}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
