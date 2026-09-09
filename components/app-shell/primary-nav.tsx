"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isActiveRoute, PRIMARY_NAV } from "@/lib/navigation";
import type { MenuKey } from "@/lib/auth/capabilities";

type PrimaryNavProps = {
  menus: MenuKey[];
};

export function PrimaryNav({ menus }: PrimaryNavProps) {
  const pathname = usePathname();
  const items = PRIMARY_NAV.filter((item) => menus.includes(item.key));

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-1 overflow-x-auto"
    >
      {items.map((item) => {
        const active = isActiveRoute(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm transition-colors",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
