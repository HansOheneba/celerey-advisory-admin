import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { UpcomingItem } from "@/lib/overview/overview-helpers";
import { cn } from "@/lib/utils";

type UpcomingSectionProps = {
  items: UpcomingItem[];
};

export function UpcomingSection({ items }: UpcomingSectionProps) {
  const visible = items.slice(0, 6);

  return (
    <section className={cn(dashboardTheme.elevatedSection, "space-y-4")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className={dashboardTheme.sectionTitle}>Upcoming</h2>
          <p className="text-sm text-muted-foreground">
            Meetings and tasks in the next two weeks.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          render={<Link href="/appointments" />}
        >
          Full schedule
          <ArrowRight />
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming items"
          description="Your schedule is clear for the next two weeks."
        />
      ) : (
        <ul className="divide-y divide-border/50">
          {visible.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex gap-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="w-28 shrink-0 pt-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {item.timeLabel}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {item.subtitle}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
