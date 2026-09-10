import type { LucideIcon } from "lucide-react";

import { CelereyAiSymbol } from "@/components/brand/celerey-ai-symbol";

type NavItemIconProps = {
  icon?: LucideIcon;
  symbol?: "celerey-ai";
};

export function NavItemIcon({ icon: Icon, symbol }: NavItemIconProps) {
  if (symbol === "celerey-ai") {
    return <CelereyAiSymbol size="sm" variant="static" />;
  }

  if (!Icon) {
    return null;
  }

  return <Icon aria-hidden />;
}
