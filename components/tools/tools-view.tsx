"use client";

import { Calculator } from "lucide-react";
import { useMemo, useState } from "react";

import {
  CashCalculatorPanel,
  EducationCalculatorPanel,
  EmergencyFundPanel,
  FxCalculatorPanel,
  GoalCalculatorPanel,
  LendingCalculatorPanel,
  MortgageVsInvestPanel,
  PropertyEquityPanel,
  RebalancePanel,
  RetirementCalculatorPanel,
  TbillCalculatorPanel,
  TaxEquivalentPanel,
  WithdrawalStressPanel,
} from "@/components/tools/calculator-panels";
import { ClientContextStrip } from "@/components/tools/client-context-strip";
import { ToolSidebar } from "@/components/tools/tool-sidebar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { TOOL_DEFINITIONS } from "@/lib/tools/registry";

export type ToolClientSeed = {
  id: string;
  name: string;
  currency: string;
  portfolioValueUsd: number;
  cashWeightingPct: number;
  targetCashWeightingPct: number;
  currentAge: number;
  retirementAge: number;
  currentSavingsUsd: number;
  monthlySavingsUsd: number;
  expectedReturnPct: number;
  desiredMonthlyIncomeUsd: number;
  safeWithdrawalRatePct: number;
  monthlyExpensesUsd: number;
  monthlyEssentialExpensesUsd: number;
  propertyValueUsd: number;
  mortgageBalanceUsd: number;
  primaryGoalTargetUsd?: number;
  primaryGoalCurrentUsd?: number;
  educationDependents?: Array<{ ageYears: number }>;
  marginalTaxRatePct?: number;
};

type ToolsViewProps = {
  clients: ToolClientSeed[];
};

const PANELS: Record<string, React.ComponentType<{ seed: ToolClientSeed }>> = {
  retirement: RetirementCalculatorPanel,
  goal: GoalCalculatorPanel,
  education: EducationCalculatorPanel,
  withdrawal: WithdrawalStressPanel,
  cash: CashCalculatorPanel,
  emergency: EmergencyFundPanel,
  rebalance: RebalancePanel,
  fx: FxCalculatorPanel,
  tbill: TbillCalculatorPanel,
  "tax-equiv": TaxEquivalentPanel,
  lending: LendingCalculatorPanel,
  property: PropertyEquityPanel,
  mortgage: MortgageVsInvestPanel,
};

const DEFAULT_TOOL_ID = TOOL_DEFINITIONS[0]?.id ?? "retirement";

export function ToolsView({ clients }: ToolsViewProps) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [activeToolId, setActiveToolId] = useState(DEFAULT_TOOL_ID);

  const seed = clients.find((client) => client.id === clientId) ?? clients[0];
  const activeTool = useMemo(
    () => TOOL_DEFINITIONS.find((tool) => tool.id === activeToolId),
    [activeToolId],
  );
  const ActivePanel = PANELS[activeToolId];

  if (!seed) {
    return (
      <div className={dashboardTheme.pageContainer}>
        <PageHeader
          eyebrow="Tools"
          title="Client calculators"
          description="Run numbers on book data during a call."
          icon={Calculator}
        />
        <EmptyState
          icon={Calculator}
          title="No clients in your book"
          description="Add a client first."
        />
      </div>
    );
  }

  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow="Tools"
        title="Client calculators"
        description="Prefilled from the client's book. Edit on the call."
        icon={Calculator}
      />

      <ClientContextStrip
        clients={clients}
        clientId={clientId}
        onClientChange={setClientId}
        seed={seed}
        onSuggestTool={setActiveToolId}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <ToolSidebar
          activeToolId={activeToolId}
          onSelectTool={setActiveToolId}
          className="hidden w-full shrink-0 lg:flex lg:w-[300px] xl:w-[320px]"
        />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="lg:hidden">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Calculator
            </p>
            <Select
              value={activeToolId}
              onValueChange={(value) => setActiveToolId(value ?? activeToolId)}
            >
              <SelectTrigger aria-label="Select calculator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOOL_DEFINITIONS.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTool ? (
            <p className="border-b border-border pb-3 text-sm font-semibold lg:hidden">
              {activeTool.label}
            </p>
          ) : null}

          {ActivePanel ? (
            <ActivePanel key={`${seed.id}-${activeToolId}`} seed={seed} />
          ) : (
            <EmptyState
              icon={Calculator}
              title="Calculator unavailable"
              description="Pick a calculator from the list."
            />
          )}
        </div>
      </div>
    </div>
  );
}
