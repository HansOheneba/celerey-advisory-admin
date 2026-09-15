import { Badge } from "@/components/ui/badge";
import type { ClientSubscription } from "@/types/client";
import { cn } from "@/lib/utils";

const labels: Record<ClientSubscription, string> = {
  not_onboarded: "Not onboarded",
  free_trial: "Free trial",
  celerey_core: "Fidelity Core",
};

const styles: Record<ClientSubscription, string> = {
  not_onboarded: "bg-muted text-muted-foreground border-border",
  free_trial: "bg-surface-warning text-warning border-border",
  celerey_core: "bg-surface-success text-success border-border",
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
