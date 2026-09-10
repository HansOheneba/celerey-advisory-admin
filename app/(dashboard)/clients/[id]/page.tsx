import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdviceTab } from "@/components/workspace/tabs/advice-tab";
import { CommsTab } from "@/components/workspace/tabs/comms-tab";
import { ComplianceTab } from "@/components/workspace/tabs/compliance-tab";
import { IntelligenceTab } from "@/components/workspace/tabs/intelligence-tab";
import { OverviewTab } from "@/components/workspace/tabs/overview-tab";
import { PlanTab } from "@/components/workspace/tabs/plan-tab";
import { PortfolioTab } from "@/components/workspace/tabs/portfolio-tab";
import { ServiceTab } from "@/components/workspace/tabs/service-tab";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import {
  WorkspaceTabs,
  type WorkspaceTabDefinition,
} from "@/components/workspace/workspace-tabs";
import { DEFAULT_CLIENT_AVAILABILITY } from "@/lib/availability/types";
import { hasCapability } from "@/lib/auth/capabilities";
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

  const tabs: WorkspaceTabDefinition[] = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <OverviewTab record={record} activity={activity} tasks={tasks} />
      ),
    },
    {
      value: "intelligence",
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
      value: "portfolio",
      label: "Portfolio",
      content: (
        <PortfolioTab
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
  ];

  if (canFull) {
    tabs.push(
      {
        value: "plan",
        label: "Plan",
        content: <PlanTab record={record} canEdit={canEditProfile} />,
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
      {
        value: "comms",
        label: "Comms",
        content: (
          <CommsTab
            clientId={id}
            clientName={clientName}
            thread={thread}
            canMessage={canMessage}
          />
        ),
      },
      {
        value: "service",
        label: "Service",
        content: (
          <ServiceTab
            clientId={id}
            documents={documents}
            reports={reports}
            serviceRequests={serviceRequests}
            tasks={tasks}
            appointments={appointments}
            availability={
              db.availability[id] ?? DEFAULT_CLIENT_AVAILABILITY
            }
            canManageDocuments={canManageDocuments}
            canGenerateReport={canGenerateReport}
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
      />

      <WorkspaceTabs tabs={tabs} defaultValue="overview" />
    </div>
  );
}
