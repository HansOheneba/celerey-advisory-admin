import type { Metadata } from "next";

import { OverviewView } from "@/components/overview/overview-view";
import {
  getAlertFeed,
  getBookMetrics,
  getUpcomingSchedule,
  getViewer,
} from "@/lib/demo/repositories";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  const [{ session, db, records }, metrics, alerts, { appointments, tasks }] =
    await Promise.all([
      getViewer(),
      getBookMetrics(),
      getAlertFeed(),
      getUpcomingSchedule(),
    ]);

  const visibleClientIds = new Set(records.map((record) => record.client.id));
  const activity = db.activity
    .filter((entry) => visibleClientIds.has(entry.clientId))
    .slice(0, 8);

  return (
    <OverviewView
      advisorName={session.name}
      capabilities={session.capabilities}
      metrics={metrics}
      records={records}
      alerts={alerts}
      activity={activity}
      appointments={appointments}
      tasks={tasks}
    />
  );
}
