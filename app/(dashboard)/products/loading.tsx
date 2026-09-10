import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function ProductsLoading() {
  return <PageSkeleton kpiCount={2} sectionCount={2} />;
}
