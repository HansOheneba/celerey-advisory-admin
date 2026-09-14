import {
  CLIENT_SEGMENT_LABELS,
  type ClientSegment,
} from "@/types/client";
import { cn } from "@/lib/utils";

export function ClientSegmentBadge({
  segment,
  className,
}: {
  segment: ClientSegment;
  className?: string;
}) {
  const label = CLIENT_SEGMENT_LABELS[segment];

  return (
    <span
      className={cn(
        "text-sm text-muted-foreground hover:text-foreground hover:underline",
        className,
      )}
      title={label}
    >
      {label}
    </span>
  );
}

export function clientSegmentLabel(segment: ClientSegment) {
  return CLIENT_SEGMENT_LABELS[segment];
}
