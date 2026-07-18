"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ChartPie,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Settings,
  Users,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { AdvisorSession } from "@/lib/dal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const primaryNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Clients", href: "/clients", icon: Users },
];

const upcomingNav = [
  { title: "Reviews", href: "#", icon: CalendarClock, disabled: true },
  { title: "Insights", href: "#", icon: ChartPie, disabled: true },
  { title: "Messages", href: "#", icon: MessageSquareText, disabled: true },
  { title: "Settings", href: "#", icon: Settings, disabled: true },
];

type AppSidebarProps = {
  advisor: AdvisorSession;
};

export function AppSidebar({ advisor }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const showSymbol = !isMobile && state === "collapsed";

  const initials = advisor.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 shrink-0 items-center justify-center border-b border-sidebar-border px-2">
        <Link
          href="/dashboard"
          className="flex size-full items-center justify-center"
          aria-label="Celerey home"
        >
          {showSymbol ? (
            <Image
              src="/logos/CelereySymbolLight.png"
              alt="Celerey"
              width={32}
              height={32}
              className="size-8 object-contain"
              priority
            />
          ) : (
            <Image
              src="/logos/logoWhite.png"
              alt="Celerey"
              width={150}
              height={38}
              className="h-9 w-auto"
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

        <SidebarGroup>
          <SidebarGroupLabel>Coming soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {upcomingNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    disabled
                    tooltip={`${item.title} (coming soon)`}
                    className="opacity-60"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[popup-open]:bg-sidebar-accent"
                    tooltip={advisor.name}
                  />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-white text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium text-sidebar-accent-foreground">
                    {advisor.name}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {advisor.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{advisor.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {advisor.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
