import {
  ArrowLeftRight,
  BarChart3,
  Calculator,
  CalendarClock,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Package,
  Sparkles,
  UserRoundCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  hasCapability,
  type CapabilitySet,
  type MenuKey,
} from "@/lib/auth/capabilities";

export type NavItem = {
  key: MenuKey;
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

/** The six top-level menus from the RM interface spec, in order. */
export const PRIMARY_NAV: NavItem[] = [
  {
    key: "overview",
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Book health, attention items and opportunities",
  },
  {
    key: "clients",
    href: "/clients",
    label: "Clients",
    icon: Users,
    description: "The client book and every client workspace",
  },
  {
    key: "copilot",
    href: "/copilot",
    label: "Copilot",
    icon: Sparkles,
    description: "Query the book and draft client material",
  },
  {
    key: "insights",
    href: "/insights",
    label: "Insights",
    icon: BarChart3,
    description: "Analytics, reports and the compliance queue",
  },
  {
    key: "products",
    href: "/products",
    label: "Products",
    icon: Package,
    description: "Investment, lending and protection catalogue",
  },
  {
    key: "tools",
    href: "/tools",
    label: "Tools",
    icon: Calculator,
    description: "Planning calculators and modelling",
  },
];

export function navItemsFor(menus: MenuKey[]): NavItem[] {
  return PRIMARY_NAV.filter((item) => menus.includes(item.key));
}

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

/** Labels for the compact top-bar breadcrumb trail. */
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  clients: "Clients",
  new: "Add client",
  invite: "Send invite",
  direct: "Create client",
  copilot: "Copilot",
  insights: "Insights",
  products: "Products",
  tools: "Tools",
  advisors: "Advisors",
  assignments: "Assignments",
  messages: "Messages",
  appointments: "Appointments",
  tasks: "Tasks",
  reports: "Reports",
  settings: "Settings",
};

/**
 * Sidebar groups: the six advisory menus, then day-to-day operations and
 * admin links gated on capabilities.
 */
export function sidebarNavFor(capabilities: CapabilitySet): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [
    {
      label: "Advisory",
      items: navItemsFor(capabilities.menus).map((item) => ({
        href: item.href,
        label: item.label,
        icon: item.icon,
      })),
    },
  ];

  const operations: SidebarNavItem[] = [];

  if (hasCapability(capabilities, "message_client")) {
    operations.push({
      href: "/messages",
      label: "Messages",
      icon: MessageSquareText,
    });
  }

  if (
    hasCapability(capabilities, "view_client_360") ||
    hasCapability(capabilities, "message_client")
  ) {
    operations.push(
      {
        href: "/appointments",
        label: "Appointments",
        icon: CalendarClock,
      },
      {
        href: "/tasks",
        label: "Tasks",
        icon: ListChecks,
      },
    );
  }

  if (operations.length > 0) {
    groups.push({ label: "Operations", items: operations });
  }

  const administration: SidebarNavItem[] = [];

  if (hasCapability(capabilities, "manage_advisors")) {
    administration.push({
      href: "/advisors",
      label: "Advisors",
      icon: UserRoundCog,
    });
  }

  if (hasCapability(capabilities, "assign_advisor")) {
    administration.push({
      href: "/assignments",
      label: "Assignments",
      icon: ArrowLeftRight,
    });
  }

  if (administration.length > 0) {
    groups.push({ label: "Administration", items: administration });
  }

  return groups;
}
