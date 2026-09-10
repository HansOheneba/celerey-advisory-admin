"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

import { decideRecommendation } from "@/app/actions/recommendations";
import { EmptyState } from "@/components/shared/empty-state";
import { IconTile } from "@/components/shared/icon-tile";
import { ListRow } from "@/components/shared/list-row";
import { SectionPanel } from "@/components/shared/section-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCompactCurrency, formatDate } from "@/lib/format";
import {
  RECOMMENDATION_STATUS_LABELS,
  type DemoRecommendation,
} from "@/lib/demo/types";

type ComplianceQueueProps = {
  recommendations: DemoRecommendation[];
  canDecide: boolean;
};

export function ComplianceQueue({
  recommendations,
  canDecide,
}: ComplianceQueueProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const pending = recommendations.filter(
    (recommendation) =>
      recommendation.status === "pending_compliance" ||
      recommendation.status === "proposed",
  );
  const decided = recommendations.filter(
    (recommendation) => !pending.includes(recommendation),
  );

  function decide(
    recommendationId: string,
    decision: "approved" | "blocked",
  ) {
    startTransition(async () => {
      const result = await decideRecommendation({
        recommendationId,
        decision,
        note: notes[recommendationId] ?? "",
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(`Recommendation ${decision}.`);
    });
  }

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Awaiting decision"
        description={`${pending.length} recommendation${pending.length === 1 ? "" : "s"} in the queue. Nothing executes until this is cleared.`}
        variant="warning"
      >
        {pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="The queue is clear"
            description="All recommendations have been reviewed."
            variant="success"
          />
        ) : (
          <div className="space-y-4">
            {pending.map((recommendation) => (
              <div
                key={recommendation.id}
                className="space-y-2 rounded-lg border border-border bg-card p-3"
              >
                <ListRow
                  leading={<IconTile icon={Clock} variant="warning" size="sm" />}
                  title={
                    <span className="text-sm font-medium">
                      {recommendation.title}
                    </span>
                  }
                  trailing={
                    <Link
                      href={`/clients/${recommendation.clientId}`}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      {recommendation.clientName}
                    </Link>
                  }
                />

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {recommendation.rationale}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatCompactCurrency(recommendation.amountUsd)} · proposed
                  by {recommendation.proposedByName} on{" "}
                  {formatDate(recommendation.createdAt)}
                </p>

                {canDecide ? (
                  <div className="space-y-2">
                    <Textarea
                      value={notes[recommendation.id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [recommendation.id]: event.target.value,
                        }))
                      }
                      placeholder="Decision note for the audit trail"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => decide(recommendation.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => decide(recommendation.id, "blocked")}
                      >
                        Block
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionPanel>

      <SectionPanel title="Decided">
        {decided.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nothing decided yet"
            description="No decided items yet. Approved and blocked recommendations show here."
          />
        ) : (
          <div className="divide-y divide-border/50">
            {decided.map((recommendation) => (
              <ListRow
                key={recommendation.id}
                leading={
                  <IconTile
                    icon={
                      recommendation.status === "blocked"
                        ? XCircle
                        : CheckCircle2
                    }
                    variant={
                      recommendation.status === "blocked" ? "warning" : "success"
                    }
                    size="sm"
                  />
                }
                title={
                  <span className="text-sm font-medium">
                    {recommendation.title}
                  </span>
                }
                meta={`${recommendation.clientName} · ${recommendation.decidedByName ?? "—"}${recommendation.decisionNote ? ` · ${recommendation.decisionNote}` : ""}`}
                trailing={
                  <Badge
                    variant={
                      recommendation.status === "blocked"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {RECOMMENDATION_STATUS_LABELS[recommendation.status]}
                  </Badge>
                }
              />
            ))}
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
