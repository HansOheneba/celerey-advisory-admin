import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ListRow } from "@/components/shared/list-row";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { cashBalance, excessCash } from "@/lib/demo/insights";
import type { DemoClientRecord } from "@/lib/demo/types";
import { formatCompactCurrency, formatCurrency, formatDate, titleCase } from "@/lib/format";
import type { ClientActivity } from "@/types/client";
import { Target, TrendingUp } from "lucide-react";

type OverviewTabProps = {
  record: DemoClientRecord;
  activity: ClientActivity[];
};

export function OverviewTab({ record, activity }: OverviewTabProps) {
  const { client, detail } = record;
  const cash = cashBalance(record);
  const deployable = excessCash(record);
  const totalGoalTarget = detail.goals.reduce(
    (total, goal) => total + (goal.target ?? 0),
    0,
  );
  const totalGoalCurrent = detail.goals.reduce(
    (total, goal) => total + goal.current,
    0,
  );
  const goalFundedPct =
    totalGoalTarget > 0
      ? Math.round((totalGoalCurrent / totalGoalTarget) * 100)
      : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionPanel
        title="Financial position"
        description="Assets under advisement and the wider balance sheet."
        variant="brand"
      >
        <StatGrid columns={2}>
          <StatItem
            label="Assets under advisement"
            value={formatCurrency(client.aua, client.currency)}
          />
          <StatItem label="Cash" value={formatCurrency(cash, client.currency)} />
          <StatItem
            label="Deployable cash"
            value={
              deployable > 0
                ? formatCurrency(deployable, client.currency)
                : "At target"
            }
          />
          <StatItem
            label="Assets held away"
            value={
              record.heldAwayUsd > 0
                ? formatCompactCurrency(record.heldAwayUsd)
                : "None recorded"
            }
          />
          <StatItem
            label="Property"
            value={formatCompactCurrency(
              detail.propertyAssets.reduce(
                (total, property) => total + (property.current_value ?? 0),
                0,
              ),
            )}
          />
          <StatItem
            label="Liabilities"
            value={formatCompactCurrency(
              detail.liabilities.reduce(
                (total, liability) => total + liability.balance,
                0,
              ),
            )}
          />
          <StatItem
            label="Monthly surplus"
            value={formatCurrency(
              detail.cashFlowSummary.monthly_surplus,
              client.currency,
            )}
          />
          <StatItem
            label="Savings rate"
            value={`${detail.cashFlowSummary.savings_rate_pct}%`}
          />
        </StatGrid>
      </SectionPanel>

      <SectionPanel
        title="Relationship"
        description={`Profile completeness ${detail.profileCompletionScore}%.`}
        variant="muted"
      >
        <StatGrid columns={2}>
          <StatItem label="Email" value={client.email} />
          <StatItem label="Phone" value={client.phone || "—"} />
          <StatItem label="Occupation" value={detail.user.occupation ?? "—"} />
          <StatItem
            label="Marital status"
            value={titleCase(detail.user.marital_status)}
          />
          <StatItem label="Residency" value={detail.user.account_mode ?? "—"} />
          <StatItem
            label="Citizenships"
            value={detail.user.citizenships.join(", ") || "—"}
          />
          <StatItem label="Dependents" value={String(detail.dependents.length)} />
          <StatItem
            label="Risk band"
            value={titleCase(detail.riskAssessment?.result?.risk_band)}
          />
        </StatGrid>
      </SectionPanel>

      <SectionPanel
        title="Goals at a glance"
        description={`${detail.goals.length} goal${detail.goals.length === 1 ? "" : "s"} · ${goalFundedPct}% funded overall.`}
        variant="success"
      >
        {detail.goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals captured"
            description="Add goals during onboarding or in the planning tab."
            variant="success"
          />
        ) : (
          <div className="space-y-3">
            {detail.goals.map((goal) => {
              const target = goal.target ?? 0;
              const pct =
                target > 0
                  ? Math.min(100, Math.round((goal.current / target) * 100))
                  : 0;

              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{goal.title}</span>
                    <span className="shrink-0 text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-emerald-500/10">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-[width] duration-300 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        title="Recent activity"
        description="Data freshness across the client record."
        variant="info"
      >
        {activity.length > 0 ? (
          <div className="divide-y divide-border/50">
            {activity.slice(0, 4).map((entry) => (
              <ListRow
                key={entry.id}
                title={<span className="text-sm">{entry.summary}</span>}
                meta={formatDate(entry.occurredAt)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No recorded activity"
            description="No interactions logged yet. Messages and meetings show here."
          />
        )}

        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/50 pt-3">
          {detail.freshness.map((entry) => (
            <Badge key={entry.section} variant="outline">
              {entry.section} · {formatDate(entry.updatedAt)}
            </Badge>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}
