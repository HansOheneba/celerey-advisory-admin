import { titleCase } from "@/lib/format";
import type { DashboardSummary } from "@/types/client";

export type DashboardInsight = {
  id: string;
  title: string;
  detail: string;
  tone: "neutral" | "attention" | "positive";
};

export function buildDashboardInsights(
  summary: DashboardSummary,
): DashboardInsight[] {
  const insights: DashboardInsight[] = [];

  if (summary.reviewsDueThisWeek > 0) {
    insights.push({
      id: "reviews-due",
      title: `${summary.reviewsDueThisWeek} review${summary.reviewsDueThisWeek === 1 ? "" : "s"} due this week`,
      detail: "Prioritise outreach so relationships stay on schedule.",
      tone: "attention",
    });
  } else {
    insights.push({
      id: "reviews-clear",
      title: "No reviews due this week",
      detail: "Your review calendar is clear — use the time for deeper check-ins.",
      tone: "positive",
    });
  }

  if (summary.onboardingCount > 0) {
    insights.push({
      id: "onboarding",
      title: `${summary.onboardingCount} client${summary.onboardingCount === 1 ? "" : "s"} still onboarding`,
      detail: "Finish invites and first meetings while momentum is high.",
      tone: "attention",
    });
  }

  const inactive =
    summary.clientsByStatus.find((row) => row.status === "inactive")?.count ??
    0;
  if (inactive > 0) {
    insights.push({
      id: "inactive",
      title: `${inactive} inactive relationship${inactive === 1 ? "" : "s"}`,
      detail: "Re-engage or archive so the book stays accurate.",
      tone: "neutral",
    });
  }

  const topRisk = [...summary.auaByRisk].sort((a, b) => b.value - a.value)[0];
  if (topRisk && topRisk.value > 0 && summary.totalAua > 0) {
    const share = Math.round((topRisk.value / summary.totalAua) * 100);
    insights.push({
      id: "risk-concentration",
      title: `${share}% of AUA in ${titleCase(topRisk.riskLevel)} risk`,
      detail: "Watch concentration so advice stays aligned with the book mix.",
      tone: share >= 50 ? "attention" : "neutral",
    });
  }

  if (summary.activeClients > 0) {
    insights.push({
      id: "active-book",
      title: `${summary.activeClients} active client${summary.activeClients === 1 ? "" : "s"}`,
      detail: "Healthy active coverage across your current assignments.",
      tone: "positive",
    });
  }

  return insights.slice(0, 4);
}
