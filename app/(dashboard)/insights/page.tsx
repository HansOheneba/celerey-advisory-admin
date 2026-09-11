import type { Metadata } from "next";

import { InsightsView } from "@/components/insights/insights-view";
import { requireSession } from "@/lib/dal";
import {
  getBookMetrics,
  getRecommendations,
  getReports,
  getScopedAiSessions,
  getScopedClientRecords,
} from "@/lib/demo/repositories";

export const metadata: Metadata = {
  title: "Insights",
};

export default async function InsightsPage() {
  const session = await requireSession();

  const [metrics, records, recommendations, reports, aiSessions] =
    await Promise.all([
      getBookMetrics(),
      getScopedClientRecords(),
      getRecommendations(),
      getReports(),
      getScopedAiSessions(),
    ]);

  return (
    <InsightsView
      capabilities={session.capabilities}
      metrics={metrics}
      records={records}
      recommendations={recommendations}
      reports={reports}
      aiSessions={aiSessions}
    />
  );
}
