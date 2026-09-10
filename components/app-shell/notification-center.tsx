"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertCircle, Bell, AlertTriangle, Info } from "lucide-react";

import { markAlertRead, markAllAlertsRead } from "@/app/actions/alerts";
import { IconTile } from "@/components/shared/icon-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AlertSeverity, DemoAlert } from "@/lib/demo/types";

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-amber-500/10 text-warning border-amber-500/20",
  info: "bg-primary/10 text-primary border-primary/20",
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  warning: "Attention",
  info: "Info",
};

const SEVERITY_ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const SEVERITY_TILE_VARIANT = {
  critical: "warning",
  warning: "warning",
  info: "brand",
} as const;

type NotificationCenterProps = {
  alerts: DemoAlert[];
};

export function NotificationCenter({ alerts }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const unread = alerts.filter((alert) => !alert.read).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
          />
        }
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Alerts</SheetTitle>
          <SheetDescription>
            {unread > 0
              ? `${unread} item${unread === 1 ? "" : "s"} need your attention.`
              : "Everything here has been reviewed."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No alerts across your book right now.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className={cn(
                    "px-4 py-3",
                    alert.read ? "opacity-60" : "bg-card",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <IconTile
                      icon={SEVERITY_ICONS[alert.severity]}
                      variant={SEVERITY_TILE_VARIANT[alert.severity]}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={SEVERITY_STYLES[alert.severity]}
                        >
                          {SEVERITY_LABELS[alert.severity]}
                        </Badge>
                        <span className="text-sm font-medium">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {alert.detail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.clientName ? `${alert.clientName} · ` : ""}
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {alert.clientId ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setOpen(false)}
                        render={
                          <Link
                            href={`/clients/${alert.clientId}${alert.workspaceTab ? `?tab=${alert.workspaceTab}` : ""}`}
                          />
                        }
                      >
                        Open workspace
                      </Button>
                    ) : null}
                    {alert.read ? null : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await markAlertRead(alert.id);
                          })
                        }
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {unread > 0 ? (
          <div className="border-t border-border p-4">
            <Button
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await markAllAlertsRead();
                })
              }
            >
              Mark all as read
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
