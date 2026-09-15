"use client";

import { ScrollText } from "lucide-react";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import type { AuditLogEntry } from "@/lib/settings/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatDate } from "@/lib/format";

type AuditLogsTabProps = {
  initialLogs: AuditLogEntry[];
};

export function AuditLogsTab({ initialLogs }: AuditLogsTabProps) {
  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <SectionEyebrow>Audit logs</SectionEyebrow>
        <CardTitle className="text-base font-semibold">
          Organization activity trail
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {initialLogs.length === 0 ? (
          <div className={dashboardTheme.emptyState}>
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <ScrollText className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">No audit events yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                No audit events logged yet. Assignments and role changes show
                here when recorded.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(log.occurredAt)}
                  </TableCell>
                  <TableCell>{log.actorName || log.actorId}</TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.targetLabel ||
                      (log.targetType
                        ? `${log.targetType}${log.targetId ? ` · ${log.targetId}` : ""}`
                        : "—")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
