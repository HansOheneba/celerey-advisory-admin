import { buildClientMetaParts } from "@/lib/clients/client-meta";
import type { ClientSegment } from "@/types/client";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";

type ClientMetaLineProps = {
  client: Client;
  segment?: ClientSegment;
  className?: string;
};

export function ClientMetaLine({
  client,
  segment,
  className,
}: ClientMetaLineProps) {
  const parts = buildClientMetaParts(client, segment);

  if (parts.length === 0) {
    return null;
  }

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {parts.join(" · ")}
    </p>
  );
}
