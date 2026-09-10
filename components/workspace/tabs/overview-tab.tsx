import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ListRow } from "@/components/shared/list-row";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Button } from "@/components/ui/button";
import { cashBalance, excessCash } from "@/lib/demo/insights";
import type { DemoClientRecord } from "@/lib/demo/types";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  titleCase,
} from "@/lib/format";
import type { Task } from "@/lib/tasks/types";
import type { ClientActivity } from "@/types/client";
import { CheckSquare, Target, TrendingUp } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatTaskDue(dueAt: string): string {
  const due = Date.parse(dueAt);
  if (!Number.isFinite(due)) {
    return "Due date TBC";
  }

  const days = Math.round((due - Date.now()) / DAY_MS);
  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  }
  if (days === 0) {
    return "Due today";
  }
  if (days === 1) {
    return "Due tomorrow";
  }
  return `Due in ${days} days`;
}

function openAdvisorTasks(tasks: Task[]): Task[] {
  return tasks
    .filter(
      (task) =>
        task.status === "open" &&
        task.assignee === "advisor" &&
        task.dueAt !== null,
    )
    .sort(
      (a, b) => Date.parse(a.dueAt ?? "") - Date.parse(b.dueAt ?? ""),
    );
}

type OverviewTabProps = {
  record: DemoClientRecord;
  activity: ClientActivity[];
  tasks: Task[];
};

export function OverviewTab({
  record,
  activity,
  tasks,
}: OverviewTabProps) {
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
  const openTasks = openAdvisorTasks(tasks);
  const visibleTasks = openTasks.slice(0, 3);

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Open tasks"
        description="Assigned to you with a due date."
        variant="brand"
        actions={
          openTasks.length > visibleTasks.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              render={
                <Link href={`/clients/${record.client.id}?tab=service`} />
              }
            >
              View all {openTasks.length}
            </Button>
          ) : null
        }
      >
        {visibleTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No open tasks"
            description="Assigned tasks with due dates appear here."
            variant="brand"
          />
        ) : (
          <ul className="divide-y divide-border/50">
            {visibleTasks.map((task) => (
              <li key={task.id} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{task.title}</p>
                {task.description ? (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
                <p
                  className={
                    task.description
                      ? "mt-0.5 text-xs text-muted-foreground"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {formatTaskDue(task.dueAt!)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel title="Balance sheet" variant="brand">
          <StatGrid columns={2}>
            <StatItem
              label="Cash"
              value={formatCurrency(cash, client.currency)}
            />
            <StatItem
              label="Deployable cash"
              value={
                deployable > 0
                  ? formatCurrency(deployable, client.currency)
                  : "At target"
              }
            />
            <StatItem
              label="Held away"
              value={
                record.heldAwayUsd > 0
                  ? formatCompactCurrency(record.heldAwayUsd)
                  : "None"
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
            <StatItem
              label="Model drift"
              value={`${record.portfolioDriftPct.toFixed(1)} pts`}
            />
          </StatGrid>
        </SectionPanel>

        <SectionPanel
          title="Profile"
          description={`${detail.profileCompletionScore}% complete.`}
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
            <StatItem
              label="Residency"
              value={detail.user.account_mode ?? "—"}
            />
            <StatItem
              label="Citizenships"
              value={detail.user.citizenships.join(", ") || "—"}
            />
            <StatItem
              label="Dependents"
              value={String(detail.dependents.length)}
            />
            <StatItem
              label="Risk band"
              value={titleCase(detail.riskAssessment?.result?.risk_band)}
            />
            <StatItem
              label="Last contact"
              value={formatDate(client.lastContactAt)}
            />
          </StatGrid>
        </SectionPanel>

        <SectionPanel
          title="Goals"
          description={
            detail.goals.length === 0
              ? "None on file."
              : `${detail.goals.length} goal${detail.goals.length === 1 ? "" : "s"}, ${goalFundedPct}% funded overall.`
          }
          variant="success"
        >
          {detail.goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Add them under Plan or during onboarding."
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
                      <span className="shrink-0 text-muted-foreground">
                        {pct}%
                      </span>
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

        <SectionPanel title="Recent activity" variant="info">
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
              title="Nothing logged yet"
              description="Messages and meetings show up here."
            />
          )}
        </SectionPanel>
      </div>
    </div>
  );
}
