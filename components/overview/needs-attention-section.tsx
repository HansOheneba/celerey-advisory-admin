import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { AttentionRow } from "@/lib/overview/overview-helpers";
import { cn } from "@/lib/utils";

type NeedsAttentionSectionProps = {
  rows: AttentionRow[];
  totalCount: number;
};

const PRIORITY_CLASS: Record<AttentionRow["priority"], string> = {
  High: "text-destructive",
  Medium: "text-amber-700",
  Low: "text-muted-foreground",
};

export function NeedsAttentionSection({
  rows,
  totalCount,
}: NeedsAttentionSectionProps) {
  const visible = rows.slice(0, 5);

  return (
    <section className={cn(dashboardTheme.elevatedSection, "space-y-4")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className={dashboardTheme.sectionTitle}>Needs attention</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount === 0
              ? "Nothing needs your attention right now."
              : `${totalCount} item${totalCount === 1 ? "" : "s"} across your book.`}
          </p>
        </div>
        {totalCount > visible.length ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            render={<Link href="/insights?tab=compliance" />}
          >
            View all {totalCount}
            <ArrowRight />
          </Button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          Your queue is clear. Check back after the next client update.
        </p>
      ) : (
        <div className={dashboardTheme.tableShell}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[88px]">Priority</TableHead>
                <TableHead className="min-w-[160px]">Client / item</TableHead>
                <TableHead className="hidden min-w-0 sm:table-cell">
                  Reason
                </TableHead>
                <TableHead className="w-[120px] whitespace-nowrap">Due</TableHead>
                <TableHead className="w-[96px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell
                    className={cn(
                      "text-xs font-medium uppercase tracking-wide",
                      PRIORITY_CLASS[row.priority],
                    )}
                  >
                    {row.priority}
                  </TableCell>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="hidden min-w-0 truncate text-muted-foreground sm:table-cell">
                    {row.reason}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.due}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={row.href} />}
                    >
                      {row.action}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
