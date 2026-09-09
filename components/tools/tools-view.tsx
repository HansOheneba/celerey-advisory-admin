"use client";

import {
  Clock,
  Home,
  PiggyBank,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { IconTile } from "@/components/shared/icon-tile";
import { PageHeader } from "@/components/shared/page-header";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCurrency } from "@/lib/format";
import {
  modelCashDeployment,
  modelLendingCapacity,
  projectGoalFunding,
  projectRetirement,
} from "@/lib/tools/calculators";
import { cn } from "@/lib/utils";

export type ToolClientSeed = {
  id: string;
  name: string;
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
};

type ToolsViewProps = {
  clients: ToolClientSeed[];
};

export function ToolsView({ clients }: ToolsViewProps) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const seed = clients.find((client) => client.id === clientId) ?? clients[0];

  if (!seed) {
    return (
      <div className={dashboardTheme.pageContainerNarrow}>
        <PageHeader
          eyebrow="Tools"
          title="Planning calculators"
          description="Add a client to your book to start modelling."
          icon={Target}
        />
        <EmptyState
          icon={Target}
          title="No clients in your book"
          description="Add a client relationship to run planning calculators."
        />
      </div>
    );
  }

  return (
    <div className={dashboardTheme.pageContainerNarrow}>
      <PageHeader
        eyebrow="Tools"
        title="Planning calculators"
        description="Run numbers before a client meeting. Inputs start from the selected client's live data."
        icon={Target}
        actions={
          <Select
            value={clientId}
            onValueChange={(value) => setClientId(value ?? clientId)}
          >
            <SelectTrigger className="w-64" aria-label="Select a client">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Tabs defaultValue="retirement" key={seed.id}>
        <TabsList>
          <TabsTrigger value="retirement">Retirement</TabsTrigger>
          <TabsTrigger value="goal">Goal funding</TabsTrigger>
          <TabsTrigger value="cash">Cash deployment</TabsTrigger>
          <TabsTrigger value="lending">Lombard capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="retirement">
          <RetirementCalculator seed={seed} />
        </TabsContent>
        <TabsContent value="goal">
          <GoalCalculator seed={seed} />
        </TabsContent>
        <TabsContent value="cash">
          <CashCalculator seed={seed} />
        </TabsContent>
        <TabsContent value="lending">
          <LendingCalculator seed={seed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
    </div>
  );
}

function CalculatorCard({
  title,
  description,
  icon: Icon,
  variant = "brand",
  inputs,
  primaryResult,
  secondaryResults,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: "brand" | "info" | "success" | "warning";
  inputs: React.ReactNode;
  primaryResult: { label: string; value: string; tone?: "neutral" | "good" | "bad" };
  secondaryResults: Array<{
    label: string;
    value: string;
    tone?: "neutral" | "good" | "bad";
  }>;
}) {
  return (
    <SectionPanel variant={variant} className="space-y-4">
      <div className="flex items-start gap-3">
        <IconTile icon={Icon} variant={variant} />
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 sm:grid-cols-2">
          {inputs}
        </div>
        <div className="space-y-4">
          <div
            className={cn(
              "rounded-xl border px-4 py-4",
              dashboardTheme.tintedSurface.brand,
            )}
          >
            <p className={dashboardTheme.statLabel}>{primaryResult.label}</p>
            <p
              className={cn(
                dashboardTheme.statValueLarge,
                primaryResult.tone === "good" && "text-emerald-600",
                primaryResult.tone === "bad" && "text-destructive",
              )}
            >
              {primaryResult.value}
            </p>
          </div>
          <StatGrid columns={2}>
            {secondaryResults.map((result) => (
              <StatItem
                key={result.label}
                label={result.label}
                value={
                  <span
                    className={cn(
                      result.tone === "good" && "text-emerald-600",
                      result.tone === "bad" && "text-destructive",
                    )}
                  >
                    {result.value}
                  </span>
                }
              />
            ))}
          </StatGrid>
        </div>
      </div>
    </SectionPanel>
  );
}

function RetirementCalculator({ seed }: { seed: ToolClientSeed }) {
  const [currentAge, setCurrentAge] = useState(seed.currentAge);
  const [retirementAge, setRetirementAge] = useState(seed.retirementAge);
  const [savings, setSavings] = useState(seed.currentSavingsUsd);
  const [monthly, setMonthly] = useState(seed.monthlySavingsUsd);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);
  const [income, setIncome] = useState(seed.desiredMonthlyIncomeUsd);

  const result = useMemo(
    () =>
      projectRetirement({
        currentAge,
        retirementAge,
        currentSavingsUsd: savings,
        monthlyContributionUsd: monthly,
        expectedReturnPct: returnPct,
        desiredMonthlyIncomeUsd: income,
        safeWithdrawalRatePct: seed.safeWithdrawalRatePct,
      }),
    [
      currentAge,
      retirementAge,
      savings,
      monthly,
      returnPct,
      income,
      seed.safeWithdrawalRatePct,
    ],
  );

  return (
    <CalculatorCard
      title="Retirement projection"
      description={`Assumes a ${seed.safeWithdrawalRatePct}% safe withdrawal rate in retirement.`}
      icon={Clock}
      variant="brand"
      inputs={
        <>
          <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} />
          <NumberField label="Retirement age" value={retirementAge} onChange={setRetirementAge} />
          <NumberField label="Invested today" value={savings} onChange={setSavings} step={1000} />
          <NumberField label="Monthly savings" value={monthly} onChange={setMonthly} step={100} />
          <NumberField label="Expected return %" value={returnPct} onChange={setReturnPct} step={0.1} />
          <NumberField label="Desired monthly income" value={income} onChange={setIncome} step={500} />
        </>
      }
      primaryResult={{
        label: "Projected pot",
        value: formatCurrency(result.projectedPotUsd, "USD"),
      }}
      secondaryResults={[
        {
          label: "Required pot",
          value: formatCurrency(result.requiredPotUsd, "USD"),
        },
        {
          label: result.gapUsd > 0 ? "Shortfall" : "Surplus",
          value: formatCurrency(Math.abs(result.gapUsd), "USD"),
          tone: result.gapUsd > 0 ? "bad" : "good",
        },
        {
          label: "Extra monthly saving needed",
          value: formatCurrency(result.additionalMonthlySavingsUsd, "USD"),
          tone: result.additionalMonthlySavingsUsd > 0 ? "bad" : "good",
        },
      ]}
    />
  );
}

function GoalCalculator({ seed }: { seed: ToolClientSeed }) {
  const [target, setTarget] = useState(500_000);
  const [current, setCurrent] = useState(120_000);
  const [monthly, setMonthly] = useState(3_000);
  const [years, setYears] = useState(8);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);

  const result = useMemo(
    () =>
      projectGoalFunding({
        targetUsd: target,
        currentUsd: current,
        monthlyContributionUsd: monthly,
        years,
        expectedReturnPct: returnPct,
      }),
    [target, current, monthly, years, returnPct],
  );

  return (
    <CalculatorCard
      title="Goal funding"
      description="Whether the current contribution reaches the target in time."
      icon={Target}
      variant="success"
      inputs={
        <>
          <NumberField label="Target" value={target} onChange={setTarget} step={10_000} />
          <NumberField label="Funded today" value={current} onChange={setCurrent} step={10_000} />
          <NumberField label="Monthly contribution" value={monthly} onChange={setMonthly} step={250} />
          <NumberField label="Years" value={years} onChange={setYears} />
          <NumberField label="Expected return %" value={returnPct} onChange={setReturnPct} step={0.1} />
        </>
      }
      primaryResult={{
        label: "Projected value",
        value: formatCurrency(result.projectedUsd, "USD"),
        tone: result.fundedPct >= 100 ? "good" : "neutral",
      }}
      secondaryResults={[
        {
          label: "Funded",
          value: `${result.fundedPct.toFixed(0)}%`,
          tone: result.fundedPct >= 100 ? "good" : "bad",
        },
        {
          label: "Shortfall",
          value: formatCurrency(result.shortfallUsd, "USD"),
          tone: result.shortfallUsd > 0 ? "bad" : "good",
        },
        {
          label: "Monthly needed",
          value: formatCurrency(result.requiredMonthlyUsd, "USD"),
        },
      ]}
    />
  );
}

function CashCalculator({ seed }: { seed: ToolClientSeed }) {
  const [portfolio, setPortfolio] = useState(seed.portfolioValueUsd);
  const [cashPct, setCashPct] = useState(seed.cashWeightingPct);
  const [targetPct, setTargetPct] = useState(seed.targetCashWeightingPct);
  const [depositPct, setDepositPct] = useState(4.5);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);

  const result = useMemo(
    () =>
      modelCashDeployment({
        portfolioValueUsd: portfolio,
        cashWeightingPct: cashPct,
        targetCashWeightingPct: targetPct,
        depositRatePct: depositPct,
        expectedReturnPct: returnPct,
      }),
    [portfolio, cashPct, targetPct, depositPct, returnPct],
  );

  return (
    <CalculatorCard
      title="Cash deployment"
      description="What the excess cash costs the client by staying on deposit."
      icon={PiggyBank}
      variant="info"
      inputs={
        <>
          <NumberField label="Portfolio value" value={portfolio} onChange={setPortfolio} step={100_000} />
          <NumberField label="Cash weighting %" value={cashPct} onChange={setCashPct} step={0.5} />
          <NumberField label="Target cash %" value={targetPct} onChange={setTargetPct} step={0.5} />
          <NumberField label="Deposit rate %" value={depositPct} onChange={setDepositPct} step={0.1} />
          <NumberField label="Expected return %" value={returnPct} onChange={setReturnPct} step={0.1} />
        </>
      }
      primaryResult={{
        label: "Deployable cash",
        value: formatCurrency(result.deployableUsd, "USD"),
      }}
      secondaryResults={[
        {
          label: "Incremental return p.a.",
          value: formatCurrency(result.incrementalAnnualReturnUsd, "USD"),
          tone: "good",
        },
        {
          label: "Value in 5 years",
          value: formatCurrency(result.fiveYearValueUsd, "USD"),
        },
        {
          label: "5-year opportunity cost",
          value: formatCurrency(result.opportunityCostUsd, "USD"),
          tone: "bad",
        },
      ]}
    />
  );
}

function LendingCalculator({ seed }: { seed: ToolClientSeed }) {
  const [portfolio, setPortfolio] = useState(seed.portfolioValueUsd);
  const [advancePct, setAdvancePct] = useState(50);
  const [existing, setExisting] = useState(0);
  const [ratePct, setRatePct] = useState(6.5);

  const result = useMemo(
    () =>
      modelLendingCapacity({
        portfolioValueUsd: portfolio,
        advanceRatePct: advancePct,
        existingBorrowingUsd: existing,
        interestRatePct: ratePct,
      }),
    [portfolio, advancePct, existing, ratePct],
  );

  return (
    <CalculatorCard
      title="Lombard capacity"
      description="Borrowing headroom against the marketable portfolio."
      icon={Home}
      variant="warning"
      inputs={
        <>
          <NumberField label="Portfolio value" value={portfolio} onChange={setPortfolio} step={100_000} />
          <NumberField label="Advance rate %" value={advancePct} onChange={setAdvancePct} step={5} />
          <NumberField label="Existing borrowing" value={existing} onChange={setExisting} step={50_000} />
          <NumberField label="Interest rate %" value={ratePct} onChange={setRatePct} step={0.1} />
        </>
      }
      primaryResult={{
        label: "Available headroom",
        value: formatCurrency(result.headroomUsd, "USD"),
        tone: "good",
      }}
      secondaryResults={[
        {
          label: "Maximum facility",
          value: formatCurrency(result.maximumFacilityUsd, "USD"),
        },
        {
          label: "Interest at full draw",
          value: formatCurrency(result.annualInterestUsd, "USD"),
        },
        {
          label: "Eligible collateral",
          value: formatCurrency(result.eligibleCollateralUsd, "USD"),
        },
      ]}
    />
  );
}
