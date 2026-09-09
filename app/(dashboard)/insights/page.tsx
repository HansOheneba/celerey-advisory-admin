import type { Metadata } from "next";

import { InsightsView } from "@/components/insights/insights-view";
import { requireSession } from "@/lib/dal";
import {
  getBookMetrics,
  getRecommendations,
  getReports,
  getScopedClientRecords,
  getViewer,
} from "@/lib/demo/repositories";

export const metadata: Metadata = {
  title: "Insights",
};

export default async function InsightsPage() {
  const session = await requireSession();

  const [metrics, records, recommendations, reports, { db }] =
    await Promise.all([
      getBookMetrics(),
      getScopedClientRecords(),
      getRecommendations(),
      getReports(),
      getViewer(),
    ]);

  return (
    <InsightsView
      capabilities={session.capabilities}
      metrics={metrics}
      records={records}
      recommendations={recommendations}
      reports={reports}
      aiSessions={db.aiSessions.slice(0, 25)}
    />
  );
}
