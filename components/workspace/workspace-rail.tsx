import { CheckCircle2, CircleAlert, CircleSlash } from "lucide-react";

import { SectionPanel } from "@/components/shared/section-panel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  NextBestAction,
  SuitabilityCheck,
  SuitabilityVerdict,
} from "@/lib/demo/types";

const VERDICT_META: Record<
  SuitabilityVerdict,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  suitable: {
    label: "Suitable",
    icon: CheckCircle2,
    className: "text-emerald-600",
  },
  review: {
    label: "Needs review",
    icon: CircleAlert,
    className: "text-amber-600",
  },
  blocked: {
    label: "Blocked",
    icon: CircleSlash,
    className: "text-destructive",
  },
};

type WorkspaceRailProps = {
  actions: NextBestAction[];
  checks: SuitabilityCheck[];
};

/**
 * The workspace right rail: what to do next, and what compliance will let you
 * do. Both are always visible so advice is never drafted in a vacuum.
 */
export function WorkspaceRail({ actions, checks }: WorkspaceRailProps) {
  return (
    <div className="space-y-4">
      <SectionPanel
        title="Next best actions"
        description="Ranked by urgency and value."
        variant="brand"
      >
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="flex gap-2.5 rounded-lg border border-primary/10 bg-background/60 p-3"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium leading-snug">
                  {action.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {action.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel
        title="Suitability"
        description="What this mandate permits before anything is proposed."
        variant="warning"
      >
        <div className="space-y-3">
          {checks.map((check) => {
            const meta = VERDICT_META[check.verdict];
            const Icon = meta.icon;

            return (
              <div key={check.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Icon
                      className={cn("size-3.5 shrink-0", meta.className)}
                      aria-hidden
                    />
                    {check.action}
                  </span>
                  <Badge
                    variant={
                      check.verdict === "blocked" ? "destructive" : "secondary"
                    }
                  >
                    {meta.label}
                  </Badge>
                </div>
                <p className="pl-5 text-xs leading-relaxed text-muted-foreground">
                  {check.reason}
                </p>
              </div>
            );
          })}
        </div>
      </SectionPanel>
    </div>
  );
}
