"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";

import {
  generateClientNarrative,
  type CopilotMode,
} from "@/app/actions/ai";
import { IconTile } from "@/components/shared/icon-tile";
import { SectionPanel } from "@/components/shared/section-panel";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Badge } from "@/components/ui/badge";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OPPORTUNITY_LABELS, type IntelligenceCard } from "@/lib/demo/types";

const NARRATIVE_MODES: Array<{ mode: CopilotMode; label: string }> = [
  { mode: "client_brief", label: "Relationship brief" },
  { mode: "meeting_prep", label: "Meeting prep" },
  { mode: "portfolio_review", label: "Portfolio commentary" },
];

type IntelligenceTabProps = {
  clientId: string;
  cards: IntelligenceCard[];
  canUseCopilot: boolean;
};

export function IntelligenceTab({
  clientId,
  cards,
  canUseCopilot,
}: IntelligenceTabProps) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [activeMode, setActiveMode] = useState<CopilotMode | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(mode: CopilotMode) {
    setActiveMode(mode);
    startTransition(async () => {
      const result = await generateClientNarrative(clientId, mode);
      setNarrative(result.content);
      setOffline(result.offline);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <SectionPanel key={card.id} variant="info">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={card.severity} />
              {card.opportunityKind ? (
                <Badge variant="secondary">
                  {OPPORTUNITY_LABELS[card.opportunityKind]}
                </Badge>
              ) : null}
            </div>
            <h3 className="mt-2 text-sm font-semibold">{card.what}</h3>
            <div className="mt-3 space-y-2">
              <div>
                <p className={dashboardTheme.statLabel}>Why it matters</p>
                <p className="text-sm leading-relaxed">{card.why}</p>
              </div>
              <div>
                <p className={dashboardTheme.statLabel}>What to do</p>
                <p className="text-sm leading-relaxed">{card.action}</p>
              </div>
            </div>
          </SectionPanel>
        ))}
      </div>

      {canUseCopilot ? (
        <SectionPanel
          title="Copilot narrative"
          description="Uses this client's portal data only. Verify before client use."
          variant="ai"
        >
          <div className="mb-3 flex items-start gap-3">
            <IconTile icon={Sparkles} variant="ai" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {NARRATIVE_MODES.map((option) => (
                <Button
                  key={option.mode}
                  size="sm"
                  variant={activeMode === option.mode ? "default" : "outline"}
                  disabled={isPending}
                  onClick={() => run(option.mode)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {isPending ? (
              <p className="text-sm text-muted-foreground">
                Fetching data…
              </p>
            ) : narrative ? (
              <div className="space-y-2">
                {offline ? (
                  <Badge variant="outline">Offline draft</Badge>
                ) : null}
                <div className={cn(dashboardTheme.calloutAi, "whitespace-pre-wrap text-sm leading-relaxed")}>
                  {narrative}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Choose an output above to generate it.
              </p>
            )}
          </div>
        </SectionPanel>
      ) : null}
    </div>
  );
}
