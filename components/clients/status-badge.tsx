import { Badge } from "@/components/ui/badge";
import type { ClientStatus, RiskLevel } from "@/types/client";
import { titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusStyles: Record<ClientStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  onboarding: "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

const riskStyles: Record<RiskLevel, string> = {
  conservative: "bg-slate-100 text-slate-700 border-slate-200",
  moderate: "bg-sky-50 text-sky-700 border-sky-200",
  growth: "bg-violet-50 text-violet-700 border-violet-200",
  aggressive: "bg-rose-50 text-rose-700 border-rose-200",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", statusStyles[status])}
    >
      {titleCase(status)}
    </Badge>
  );
}

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", riskStyles[riskLevel])}
    >
      {titleCase(riskLevel)}
    </Badge>
  );
}
