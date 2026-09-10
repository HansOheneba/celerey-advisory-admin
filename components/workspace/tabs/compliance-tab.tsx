import { CheckCircle2, CircleAlert, CircleSlash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  ComplianceCheckStatus,
  DemoClientRecord,
  DemoComplianceRecord,
  SuitabilityCheck,
} from "@/lib/demo/types";
import type { AuditLogEntry } from "@/lib/settings/audit";

const STATUS_META: Record<
  ComplianceCheckStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  passed: { label: "Passed", icon: CheckCircle2, className: "text-emerald-600" },
  attention: {
    label: "Attention",
    icon: CircleAlert,
    className: "text-amber-600",
  },
  failed: { label: "Failed", icon: CircleSlash, className: "text-destructive" },
};

type ComplianceTabProps = {
  record: DemoClientRecord;
  compliance: DemoComplianceRecord[];
  suitability: SuitabilityCheck[];
  auditLogs: AuditLogEntry[];
};

export function ComplianceTab({
  record,
  compliance,
  suitability,
  auditLogs,
}: ComplianceTabProps) {
  const { client, detail } = record;
  const assessment = detail.riskAssessment;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Compliance checks</CardTitle>
            <CardDescription>KYC, AML, and suitability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {compliance.map((entry) => {
              const meta = STATUS_META[entry.status];
              const Icon = meta.icon;

              return (
                <div
                  key={entry.id}
                  className="space-y-1 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon
                        className={cn("size-4", meta.className)}
                        aria-hidden
                      />
                      {entry.label}
                    </span>
                    <Badge
                      variant={
                        entry.status === "failed" ? "destructive" : "secondary"
                      }
                    >
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="pl-6 text-sm leading-relaxed text-muted-foreground">
                    {entry.detail}
                  </p>
                  <p className="pl-6 text-xs text-muted-foreground">
                    Reviewed {formatDate(entry.reviewedAt)} by{" "}
                    {entry.reviewedBy}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Risk mandate</CardTitle>
            <CardDescription>
              {titleCase(client.riskLevel)} profile, assessed{" "}
              {assessment ? formatDate(assessment.created_at) : "—"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessment?.result ? (
              <>
                <p className="text-sm leading-relaxed">
                  {assessment.result.description}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Strategy: {assessment.result.strategy}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No risk assessment on file.
              </p>
            )}

            <div className="space-y-2 border-t border-border/50 pt-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Suitability gate
              </p>
              {suitability.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>{check.action}</span>
                  <Badge
                    variant={
                      check.verdict === "blocked"
                        ? "destructive"
                        : check.verdict === "review"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {check.verdict}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
          <CardDescription>Actions on this client record.</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recorded actions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.action}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.targetLabel ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.actorName}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(entry.occurredAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
