import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AssignedAdvisorBadgeProps = {
  advisorName?: string;
  className?: string;
};

export function AssignedAdvisorBadge({
  advisorName,
  className,
}: AssignedAdvisorBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("max-w-[14rem] truncate font-normal", className)}
      title={advisorName || "Unassigned"}
    >
      RM · {advisorName?.trim() || "Unassigned"}
    </Badge>
  );
}
