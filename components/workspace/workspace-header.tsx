import Link from "next/link";
import { CalendarPlus, MessageSquare } from "lucide-react";

import { RiskBadge, StatusBadge } from "@/components/clients/status-badge";
import { SubscriptionBadge } from "@/components/clients/subscription-badge";
import { GenerateReportButton } from "@/components/reports/generate-report-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactCurrency, formatDate, getInitials } from "@/lib/format";
import { CLIENT_SEGMENT_LABELS, type DemoClientRecord } from "@/lib/demo/types";

type WorkspaceHeaderProps = {
  record: DemoClientRecord;
  canMessage: boolean;
  canGenerateReport: boolean;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

export function WorkspaceHeader({
  record,
  canMessage,
  canGenerateReport,
}: WorkspaceHeaderProps) {
  const { client } = record;
  const name = `${client.firstName} ${client.lastName}`;

  return (
    <div className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(client.firstName, client.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                {name}
              </h1>
              <Badge variant="secondary">
                {CLIENT_SEGMENT_LABELS[record.segment]}
              </Badge>
              <StatusBadge status={client.status} />
              <RiskBadge riskLevel={client.riskLevel} />
              <SubscriptionBadge subscription={client.subscription} />
            </div>
            <p className="text-sm text-muted-foreground">
              {client.location} · Client since {formatDate(client.joinedAt)} ·
              Managed by {client.advisorName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canMessage ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/clients/${client.id}?tab=comms`} />}
            >
              <MessageSquare />
              Message
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/appointments" />}
          >
            <CalendarPlus />
            Book meeting
          </Button>
          {canGenerateReport ? (
            <GenerateReportButton clientId={client.id} />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="AUA" value={formatCompactCurrency(client.aua)} />
        <Stat
          label="Performance TTM"
          value={`${record.performanceYtdPct >= 0 ? "+" : ""}${record.performanceYtdPct.toFixed(1)}%`}
        />
        <Stat
          label="Cash weighting"
          value={`${record.idleCashPct.toFixed(1)}% / ${record.targetCashPct}%`}
        />
        <Stat
          label="Model drift"
          value={`${record.portfolioDriftPct.toFixed(1)} pts`}
        />
        <Stat label="Last contact" value={formatDate(client.lastContactAt)} />
        <Stat label="Next review" value={formatDate(client.nextReviewAt)} />
      </div>
    </div>
  );
}
