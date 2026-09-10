import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function InsightsLoading() {
  return <PageSkeleton kpiCount={4} sectionCount={2} />;
}
