import { Badge } from "@/components/ui/badge";
import type { ClientSubscription } from "@/types/client";
import { cn } from "@/lib/utils";

const labels: Record<ClientSubscription, string> = {
  not_onboarded: "Not onboarded",
  free_trial: "Free trial",
  celerey_core: "Celerey Core",
};

const styles: Record<ClientSubscription, string> = {
  not_onboarded: "bg-slate-100 text-slate-700 border-slate-200",
  free_trial: "bg-amber-50 text-warning border-amber-200",
  celerey_core: "bg-emerald-50 text-success border-emerald-200",
};

export function SubscriptionBadge({
  subscription,
}: {
  subscription: ClientSubscription;
}) {
  return (
    <Badge variant="outline" className={cn(styles[subscription])}>
      {labels[subscription]}
    </Badge>
  );
}

export function subscriptionLabel(subscription: ClientSubscription) {
  return labels[subscription];
}
