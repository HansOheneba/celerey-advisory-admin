import { StatusPill, type StatusPillTone } from "@/components/ui/status-pill";
import type { ClientStatus, RiskLevel } from "@/types/client";
import { titleCase } from "@/lib/format";

const statusTones: Record<ClientStatus, StatusPillTone> = {
  active: "success",
  onboarding: "blue",
  review: "warning",
  inactive: "neutral",
};

const riskTones: Record<RiskLevel, StatusPillTone> = {
  conservative: "neutral",
  moderate: "info",
  growth: "brand",
  aggressive: "danger",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <StatusPill
      label={titleCase(status)}
      tone={statusTones[status]}
      className="normal-case tracking-normal"
    />
  );
}

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <StatusPill
      label={titleCase(riskLevel)}
      tone={riskTones[riskLevel]}
      className="normal-case tracking-normal"
    />
  );
}
