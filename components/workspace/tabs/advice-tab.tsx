"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  decideRecommendation,
  proposeRecommendation,
} from "@/app/actions/recommendations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCompactCurrency, formatDate } from "@/lib/format";
import {
  RECOMMENDATION_STATUS_LABELS,
  type DemoProduct,
  type DemoRecommendation,
  type SuitabilityCheck,
} from "@/lib/demo/types";

const STATUS_VARIANTS: Record<
  DemoRecommendation["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  proposed: "secondary",
  pending_compliance: "secondary",
  approved: "default",
  blocked: "destructive",
  executed: "default",
};

type AdviceTabProps = {
  clientId: string;
  recommendations: DemoRecommendation[];
  products: DemoProduct[];
  suitability: SuitabilityCheck[];
  canPropose: boolean;
  canApprove: boolean;
  canExecute: boolean;
};

export function AdviceTab({
  clientId,
  recommendations,
  products,
  suitability,
  canPropose,
  canApprove,
  canExecute,
}: AdviceTabProps) {
  const [title, setTitle] = useState("");
  const [rationale, setRationale] = useState("");
  const [productId, setProductId] = useState("none");
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const blockedActions = suitability
    .filter((check) => check.verdict === "blocked")
    .map((check) => check.action.toLowerCase());

  function submit() {
    startTransition(async () => {
      const result = await proposeRecommendation({
        clientId,
        title,
        rationale,
        productId: productId === "none" ? null : productId,
        amountUsd: Number(amount.replace(/[^0-9.]/g, "")) || 0,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Recommendation sent to the compliance queue.");
      setTitle("");
      setRationale("");
      setProductId("none");
      setAmount("");
    });
  }

  function decide(
    recommendationId: string,
    decision: "approved" | "blocked" | "executed",
  ) {
    startTransition(async () => {
      const result = await decideRecommendation({
        recommendationId,
        decision,
        note: "",
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
      {canPropose ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Propose a recommendation</CardTitle>
            <CardDescription>
              Goes to compliance before execution.
              {blockedActions.length > 0
                ? ` Blocked: ${blockedActions.join(", ")}.`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="recommendation-title">Title</Label>
                <Input
                  id="recommendation-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Deploy excess cash into treasury plus"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recommendation-amount">Amount (USD)</Label>
                <Input
                  id="recommendation-amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="1500000"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recommendation-product">Product</Label>
              <Select
                value={productId}
                onValueChange={(value) => setProductId(value ?? "none")}
              >
                <SelectTrigger id="recommendation-product">
                  <SelectValue placeholder="No specific product" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="none">No specific product</SelectItem>
                  {products
                    .filter((product) => product.available)
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recommendation-rationale">Rationale</Label>
              <Textarea
                id="recommendation-rationale"
                value={rationale}
                onChange={(event) => setRationale(event.target.value)}
                placeholder="Why this fits the mandate."
                rows={3}
              />
            </div>

            <Button onClick={submit} disabled={isPending || !title.trim()}>
              Send for compliance review
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Advice history</CardTitle>
          <CardDescription>
            {recommendations.length} recommendation
            {recommendations.length === 1 ? "" : "s"} on file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="space-y-2 rounded-lg border border-border p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {recommendation.title}
                  </span>
                  <Badge variant={STATUS_VARIANTS[recommendation.status]}>
                    {RECOMMENDATION_STATUS_LABELS[recommendation.status]}
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {recommendation.rationale}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatCompactCurrency(recommendation.amountUsd)} · proposed
                  by {recommendation.proposedByName} on{" "}
                  {formatDate(recommendation.createdAt)}
                  {recommendation.decidedByName
                    ? ` · decided by ${recommendation.decidedByName}`
                    : ""}
                </p>

                {recommendation.decisionNote ? (
                  <p className="rounded-md bg-muted/50 p-2 text-xs leading-relaxed">
                    {recommendation.decisionNote}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {canApprove &&
                  (recommendation.status === "pending_compliance" ||
                    recommendation.status === "proposed") ? (
                    <>
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
                    </>
                  ) : null}

                  {canExecute && recommendation.status === "approved" ? (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => decide(recommendation.id, "executed")}
                    >
                      Execute
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
