import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdviceTab } from "@/components/workspace/tabs/advice-tab";
import { AdvisoryTab } from "@/components/workspace/tabs/advisory-tab";
import { AssetsTab } from "@/components/workspace/tabs/assets-tab";
import { CashFlowTab } from "@/components/workspace/tabs/cash-flow-tab";
import { ComplianceTab } from "@/components/workspace/tabs/compliance-tab";
import { GoalsTab } from "@/components/workspace/tabs/goals-tab";
import { InsuranceTab } from "@/components/workspace/tabs/insurance-tab";
import { IntelligenceTab } from "@/components/workspace/tabs/intelligence-tab";
import { LiabilitiesTab } from "@/components/workspace/tabs/liabilities-tab";
import { OverviewTab } from "@/components/workspace/tabs/overview-tab";
import { NotesTab } from "@/components/workspace/tabs/notes-tab";
import { ProfileTab } from "@/components/workspace/tabs/profile-tab";
import { PropertiesTab } from "@/components/workspace/tabs/properties-tab";
import { RetirementTab } from "@/components/workspace/tabs/retirement-tab";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import {
  WorkspaceTabs,
  type WorkspaceTabDefinition,
} from "@/components/workspace/workspace-tabs";
import { DEFAULT_CLIENT_AVAILABILITY } from "@/lib/availability/types";
import { hasCapability, showsAssignedAdvisor } from "@/lib/auth/capabilities";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { requireSession } from "@/lib/dal";
import { intelligenceCards, suitabilityChecks } from "@/lib/demo/insights";
import {
  getClientAppointments,
  getClientDocuments,
  getClientRecord,
  getClientTasks,
  getClientThread,
  getComplianceRecords,
  getProducts,
  getRecommendations,
  getReports,
  getServiceRequests,
  getViewer,
} from "@/lib/demo/repositories";

type ClientWorkspacePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ClientWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;
  const record = await getClientRecord(id);

  if (!record) {
    return { title: "Client" };
  }

  return {
    title: `${record.client.firstName} ${record.client.lastName}`,
  };
}

export default async function ClientWorkspacePage({
  params,
}: ClientWorkspacePageProps) {
  const session = await requireSession();
  const { id } = await params;
  const record = await getClientRecord(id);

  if (!record) {
    notFound();
  }

  const [
    { db },
    thread,
    documents,
    tasks,
    appointments,
    reports,
    serviceRequests,
    compliance,
    recommendations,
  ] = await Promise.all([
    getViewer(),
    getClientThread(id),
    getClientDocuments(id),
    getClientTasks(id),
    getClientAppointments(id),
    getReports(id),
    getServiceRequests(id),
    getComplianceRecords(id),
    getRecommendations({ clientId: id }),
  ]);

  const { capabilities } = session;
  const canFull = hasCapability(capabilities, "view_client_360");
  const canPortfolio = hasCapability(capabilities, "view_client_portfolio");
  const canMessage = hasCapability(capabilities, "message_client");
  const canGenerateReport = hasCapability(capabilities, "generate_report");
  const canManageDocuments = hasCapability(capabilities, "manage_documents");
  const canEditProfile = hasCapability(capabilities, "edit_client_data");
  const canEditPortfolio =
    canEditProfile || hasCapability(capabilities, "execute_trade");

  const cards = intelligenceCards(record);
  const checks = suitabilityChecks(record);
  const activity = db.activity.filter((entry) => entry.clientId === id);
  const auditLogs = db.auditLogs.filter(
    (entry) => entry.targetId === id || entry.targetLabel?.includes(id),
  );

  const clientName = `${record.client.firstName} ${record.client.lastName}`;

  const financialTabs: WorkspaceTabDefinition[] = canPortfolio
    ? [
        {
          value: "overview",
          label: "Overview",
          content: (
            <OverviewTab
              record={record}
              activity={activity}
              tasks={tasks}
              showInternalNotes={canFull}
              canEditInternalNotes={canEditProfile}
            />
          ),
        },
        {
          value: "goals",
          label: "Goals",
          content: <GoalsTab record={record} canEdit={canEditProfile} />,
        },
        {
          value: "assets",
          label: "Assets",
          content: (
            <AssetsTab
              client={record.client}
              detail={record.detail}
              idleCashPct={record.idleCashPct}
              targetCashPct={record.targetCashPct}
              driftPct={record.portfolioDriftPct}
              heldAwayUsd={record.heldAwayUsd}
              canEdit={canEditPortfolio}
            />
          ),
        },
        {
          value: "properties",
          label: "Properties",
          content: <PropertiesTab record={record} canEdit={canEditProfile} />,
        },
        {
          value: "insurance",
          label: "Insurance",
          content: <InsuranceTab record={record} canEdit={canEditProfile} />,
        },
        {
          value: "cash-flow",
          label: "Cash flow",
          content: <CashFlowTab record={record} canEdit={canEditProfile} />,
        },
        {
          value: "liabilities",
          label: "Liabilities",
          content: <LiabilitiesTab record={record} canEdit={canEditProfile} />,
        },
        {
          value: "retirement",
          label: "Retirement",
          content: <RetirementTab record={record} canEdit={canEditProfile} />,
        },
      ]
    : [];

  const tabs: WorkspaceTabDefinition[] = [...financialTabs];

  if (canFull) {
    tabs.push(
      {
        value: "profile",
        label: "Profile",
        content: <ProfileTab record={record} canEdit={canEditProfile} />,
      },
      {
        value: "notes",
        label: "Notes",
        content: <NotesTab record={record} canEdit={canEditProfile} />,
      },
      {
        value: "advisory",
        label: "Advisory",
        content: (
          <AdvisoryTab
            clientId={id}
            clientName={clientName}
            thread={thread}
            documents={documents}
            reports={reports}
            serviceRequests={serviceRequests}
            tasks={tasks}
            appointments={appointments}
            availability={db.availability[id] ?? DEFAULT_CLIENT_AVAILABILITY}
            canMessage={canMessage}
            canManageDocuments={canManageDocuments}
            canGenerateReport={canGenerateReport}
          />
        ),
      },
      {
        value: "insights",
        label: "Insights",
        content: (
          <IntelligenceTab
            clientId={id}
            cards={cards}
            canUseCopilot={hasCapability(capabilities, "use_copilot")}
          />
        ),
      },
      {
        value: "advice",
        label: "Advice",
        content: (
          <AdviceTab
            clientId={id}
            recommendations={recommendations}
            products={getProducts()}
            suitability={checks}
            canPropose={hasCapability(capabilities, "propose_recommendation")}
            canApprove={hasCapability(capabilities, "approve_recommendation")}
            canExecute={hasCapability(capabilities, "execute_trade")}
          />
        ),
      },
    );
  }

  tabs.push({
    value: "compliance",
    label: "Compliance",
    content: (
      <ComplianceTab
        record={record}
        compliance={compliance}
        suitability={checks}
        auditLogs={auditLogs}
      />
    ),
  });

  return (
    <div className={dashboardTheme.pageContainer}>
      <WorkspaceHeader
        record={record}
        canMessage={canMessage}
        canGenerateReport={canGenerateReport}
        showAssignedAdvisor={showsAssignedAdvisor(capabilities.scope)}
      />

      <WorkspaceTabs
        tabs={tabs}
        defaultValue={tabs[0]?.value ?? "compliance"}
      />
    </div>
  );
}
