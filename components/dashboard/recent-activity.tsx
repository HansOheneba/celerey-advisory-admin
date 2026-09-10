import type { Client, ClientActivity } from "@/types/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCurrency, formatDate, getInitials, titleCase } from "@/lib/format";

type RecentActivityProps = {
  activity: ClientActivity[];
  recentClients: Client[];
};

export function RecentActivity({
  activity,
  recentClients,
}: RecentActivityProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card className={dashboardTheme.card}>
        <CardHeader>
          <p className={dashboardTheme.sectionLabel}>Engagement</p>
          <CardTitle className="text-base font-semibold">
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activity.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.clientName}</p>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              </div>
              <div className="shrink-0 text-right">
                <Badge variant="secondary">{titleCase(item.type)}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(item.occurredAt)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className={dashboardTheme.card}>
        <CardHeader>
          <p className={dashboardTheme.sectionLabel}>Relationships</p>
          <CardTitle className="text-base font-semibold">
            Recently contacted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentClients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(client.firstName, client.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {client.firstName} {client.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {client.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(client.aua, client.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(client.lastContactAt)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
