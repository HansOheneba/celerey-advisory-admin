import {
  AddGoalDialog,
  EditGoalDialog,
} from "@/components/clients/profile/profile-editors";
import { RemoveProfileItemButton } from "@/components/clients/profile/remove-profile-item-button";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Badge } from "@/components/ui/badge";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type GoalsTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function GoalsTab({ record, canEdit }: GoalsTabProps) {
  const { client, detail } = record;
  const currency = client.currency;
  const clientId = client.id;

  return (
    <div className="space-y-4">
      <StatGrid columns={3}>
        <StatItem
          label="Active goals"
          value={String(detail.goalsMeta.activeGoals)}
        />
        <StatItem
          label="Completed"
          value={String(detail.goalsMeta.completedGoals)}
        />
        <StatItem
          label="Monthly required"
          value={formatCurrency(detail.goalsMeta.totalMonthlyNeeded, currency)}
        />
      </StatGrid>

      <SectionPanel
        title="Goals"
        description={`${formatCurrency(detail.goalsMeta.totalMonthlyNeeded, currency)}/mo across ${detail.goalsMeta.activeGoals} active goals.`}
        variant="success"
        actions={canEdit ? <AddGoalDialog clientId={clientId} /> : null}
      >
        {detail.goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No goals on file.</p>
        ) : (
          <div className={dashboardTheme.tableShell}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Funded</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Horizon</TableHead>
                  {canEdit ? <TableHead className="w-10" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.goals.map((goal) => {
                  const target = goal.target ?? 0;
                  const pct =
                    target > 0
                      ? Math.round((goal.current / target) * 100)
                      : 0;

                  return (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {goal.category}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={pct >= 85 ? "secondary" : "destructive"}
                        >
                          {pct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(target, currency)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(
                          goal.monthlyContribution ?? 0,
                          currency,
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {goal.yearsRemaining ?? "—"} yr
                      </TableCell>
                      {canEdit ? (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <EditGoalDialog
                              clientId={clientId}
                              goal={{
                                id: goal.id,
                                title: goal.title,
                                current: goal.current,
                                target: goal.target,
                              }}
                            />
                            <RemoveProfileItemButton
                              clientId={clientId}
                              collection="goals"
                              itemId={goal.id}
                              label={goal.title}
                            />
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
