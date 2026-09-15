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
import {
  APPLICATION_NAME,
  LOGO_SYMBOL,
  LOGO_WORDMARK_DARK,
} from "@/lib/brand";
import { NavItemIcon } from "@/components/shared/nav-item-icon";
import { cn } from "@/lib/utils";
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

  const navButtonClass = (active: boolean, isAi = false) =>
    cn(
      "rounded-none px-3 py-2 text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-secondary/70 hover:text-foreground active:scale-[0.98]",
      active && "sidebar-nav-active",
      active && isAi && "[&_svg]:text-accent-purple",
    );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 shrink-0 flex-row items-center justify-center gap-0 border-b border-border p-0 px-3">
        <Link
          href="/dashboard"
          className="flex size-full items-center justify-center transition-opacity duration-150 ease-out hover:opacity-90 active:scale-[0.98]"
          aria-label={`${APPLICATION_NAME} home`}
        >
          {showSymbol ? (
            <Image
              src={LOGO_SYMBOL}
              alt={APPLICATION_NAME}
              width={40}
              height={40}
              className="size-9 object-contain"
              priority
            />
          ) : (
            <Image
              src={LOGO_WORDMARK_DARK}
              alt={APPLICATION_NAME}
              width={176}
              height={44}
              className="h-10 w-auto"
              priority
            />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="p-0 py-2">
            <SidebarGroupLabel className="px-3 text-[11px] text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActiveRoute(pathname, item.href);
                  const isAi = item.symbol === "celerey-ai";

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        className={navButtonClass(active, isAi)}
                        render={<Link href={item.href} />}
                      >
                        <NavItemIcon icon={item.icon} symbol={item.symbol} />
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

      <SidebarFooter className="border-t border-sidebar-border p-0 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={settingsActive}
              tooltip="Settings"
              className={navButtonClass(settingsActive)}
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
