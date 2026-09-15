import type { ReactNode } from "react";

import { dashboardTheme } from "@/lib/dashboard-theme";
import { headingTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

type SectionEyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  const content =
    typeof children === "string" ? headingTitle(children) : children;

  return (
    <p className={cn(dashboardTheme.sectionLabel, className)}>{content}</p>
  );
}
