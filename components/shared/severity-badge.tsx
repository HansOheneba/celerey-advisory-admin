import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/lib/demo/types";

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: "border-destructive/20 bg-destructive/10 text-destructive",
  warning: "border-amber-500/20 bg-amber-500/10 text-warning",
  info: "border-primary/20 bg-primary/10 text-primary",
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  warning: "Attention",
  info: "Info",
};

type SeverityBadgeProps = {
  severity: AlertSeverity;
  label?: string;
  className?: string;
};

export function SeverityBadge({
  severity,
  label,
  className,
}: SeverityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(SEVERITY_STYLES[severity], className)}
    >
      {label ?? SEVERITY_LABELS[severity]}
    </Badge>
  );
}
