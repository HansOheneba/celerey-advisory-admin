"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

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
import type { CapabilitySet } from "@/lib/auth/capabilities";
import { isActiveRoute, sidebarNavFor } from "@/lib/navigation";

type AppSidebarProps = {
  capabilities: CapabilitySet;
};

export function AppSidebar({ capabilities }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const showSymbol = !isMobile && state === "collapsed";
  const groups = sidebarNavFor(capabilities);
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
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        className="data-[active=true]:border-l-2 data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-accent"
                        render={<Link href={item.href} />}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
