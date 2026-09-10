import { formatRelationshipLabel } from "@/lib/clients/asset-relationship";
import { StatusPill, type StatusPillTone } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

const RELATIONSHIP_TONES = {
  aua: "info",
  aum: "brand",
} as const satisfies Record<string, StatusPillTone>;

type AssetRelationshipBadgeProps = {
  aua: number;
  aum: number;
  className?: string;
  compact?: boolean;
};

export function AssetRelationshipBadge({
  aua,
  aum,
  className,
  compact = false,
}: AssetRelationshipBadgeProps) {
  const label = formatRelationshipLabel(aua, aum);

  if (label === "None") {
    return null;
  }

  if (label === "AUA + AUM") {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
        <StatusPill label="AUA" tone={RELATIONSHIP_TONES.aua} />
        <StatusPill label="AUM" tone={RELATIONSHIP_TONES.aum} />
      </span>
    );
  }

  const tone =
    label === "AUA" ? RELATIONSHIP_TONES.aua : RELATIONSHIP_TONES.aum;

  return (
    <StatusPill
      label={compact ? label : label}
      tone={tone}
      className={className}
    />
  );
}

export function AssetAmountCell({
  value,
  currency,
  format,
}: {
  value: number;
  currency: "USD" | "GHS" | "GBP";
  format: (value: number, currency?: "USD" | "GHS" | "GBP") => string;
}) {
  if (value <= 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return <span>{format(value, currency)}</span>;
}
