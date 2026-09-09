import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatDate } from "@/lib/format";
import type { ClientActivity } from "@/types/client";
import { cn } from "@/lib/utils";

type RecentActivitySectionProps = {
  activity: ClientActivity[];
};

export function RecentActivitySection({
  activity,
}: RecentActivitySectionProps) {
  const visible = activity.slice(0, 6);

  return (
    <section className={cn(dashboardTheme.elevatedSection, "space-y-4")}>
      <div className="space-y-1">
        <h2 className={dashboardTheme.sectionTitle}>Recent activity</h2>
        <p className="text-sm text-muted-foreground">
          Latest movements across your relationships.
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No recent activity"
          description="Activity logs here when clients trade, message, or review."
        />
      ) : (
        <ul className="divide-y divide-border/50">
          {visible.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/clients/${entry.clientId}`}
                className="flex items-start justify-between gap-3 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="min-w-0">
                  <span className="block text-sm">{entry.summary}</span>
                  <span className="block text-xs text-muted-foreground">
                    {entry.clientName} · {formatDate(entry.occurredAt)}
                  </span>
                </span>
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {activity.length > visible.length ? (
        <Button variant="ghost" size="sm" render={<Link href="/clients" />}>
          View clients
        </Button>
      ) : null}
    </section>
  );
}
