import Link from "next/link";
import { UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssignedAdvisorBadgeProps = {
  advisorId?: string;
  advisorName?: string;
  className?: string;
  /** Prefix with "RM ·" — omit when the column header already says RM. */
  showRmPrefix?: boolean;
  /** Link to the advisor profile and assigned client book. */
  linkToBook?: boolean;
};

export function AssignedAdvisorBadge({
  advisorId,
  advisorName,
  className,
  showRmPrefix = true,
  linkToBook = false,
}: AssignedAdvisorBadgeProps) {
  const name = advisorName?.trim() || "Unassigned";
  const label = showRmPrefix ? `RM · ${name}` : name;

  if (linkToBook) {
    if (!advisorId) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className={cn("max-w-[14rem]", className)}
        >
          <UserRound />
          <span className="truncate">{label}</span>
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("max-w-[14rem] font-normal", className)}
        title={`View ${name}'s book`}
        render={<Link href={`/advisors/${advisorId}`} />}
      >
        <UserRound />
        <span className="truncate">{label}</span>
      </Button>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn("max-w-[14rem] truncate font-normal", className)}
      title={name}
    >
      {label}
    </Badge>
  );
}
