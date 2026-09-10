"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionPanel } from "@/components/shared/section-panel";
import { Badge } from "@/components/ui/badge";
import { formatCompactCurrency } from "@/lib/format";
import {
  GHANA_MAP_THEME,
  ghanaRegionColorForShare,
} from "@/lib/overview/ghana-map-colors";
import type { GhanaRegionalSpread } from "@/lib/overview/book-analytics";
import { cn } from "@/lib/utils";

/** Ghana is taller than wide — keep the frame portrait-oriented so fitBounds shows the full country. */
const GHANA_MAP_HEIGHT = "clamp(480px, 58vh, 620px)";

const GhanaClickableMap = dynamic(
  () =>
    import("@/components/maps/ghana-clickable-map").then(
      (mod) => mod.GhanaClickableMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex w-full items-center justify-center rounded-lg bg-muted/30 animate-pulse text-sm text-muted-foreground"
        style={{ height: GHANA_MAP_HEIGHT }}
      >
        Loading map…
      </div>
    ),
  },
);

type GhanaRegionalMapProps = {
  spread: GhanaRegionalSpread;
};

export function GhanaRegionalMap({ spread }: GhanaRegionalMapProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [mapInstanceKey, setMapInstanceKey] = useState(0);

  const regionColors = useMemo(() => {
    const colors: Record<string, string> = {};
    for (const region of spread.regions) {
      colors[region.label] = ghanaRegionColorForShare(region.sharePct);
    }
    return colors;
  }, [spread.regions]);

  if (spread.totalClients === 0) {
    return (
      <SectionPanel
        title="Client locations in Ghana"
        description="Where your Ghana-resident relationships are based."
        variant="muted"
      >
        <EmptyState
          icon={MapPin}
          title="No Ghana clients in scope"
          description="Clients with Ghana residency appear here by region."
        />
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Client locations in Ghana"
      description={`${spread.totalClients} relationships · ${formatCompactCurrency(spread.totalCovered)} covered (AUA ${formatCompactCurrency(spread.totalAua)} · AUM ${formatCompactCurrency(spread.totalAum)}) across ${spread.regions.length} region${spread.regions.length === 1 ? "" : "s"}`}
      variant="muted"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-stretch">
        <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-lg border border-border/50 bg-[#e8edf4] lg:mx-0 lg:max-w-none">
          <Suspense
            fallback={
              <div
                className="flex items-center justify-center bg-muted/30 animate-pulse text-sm text-muted-foreground"
                style={{ height: GHANA_MAP_HEIGHT }}
              >
                Loading map…
              </div>
            }
          >
            <GhanaClickableMap
              key={mapInstanceKey}
              updateUrl={false}
              mapHeight={GHANA_MAP_HEIGHT}
              className="w-full"
              regionColors={regionColors}
              defaultColor={GHANA_MAP_THEME.defaultColor}
              selectedColor={GHANA_MAP_THEME.selectedColor}
              hoverColor={GHANA_MAP_THEME.hoverColor}
              initialRegion={activeLabel}
              onRegionClick={(region) => setActiveLabel(region)}
            />
          </Suspense>
        </div>

        <div
          className={cn(
            "min-h-0 space-y-2 overflow-y-auto overscroll-y-contain pr-1",
            "max-h-80 sm:max-h-96",
            "lg:max-h-[clamp(480px,58vh,620px)]",
          )}
          aria-label="Ghana regions"
        >
          {spread.regions.map((region) => (
            <button
              key={region.code}
              type="button"
              onMouseEnter={() => setActiveLabel(region.label)}
              onMouseLeave={() => setActiveLabel(null)}
              onClick={() => {
                setActiveLabel(region.label);
                setMapInstanceKey((key) => key + 1);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                activeLabel === region.label
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/50 hover:bg-muted/40",
              )}
            >
              <div>
                <p className="font-medium">{region.label}</p>
                <p className="text-xs text-muted-foreground">
                  {region.clientCount} client
                  {region.clientCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium tabular-nums">
                  {formatCompactCurrency(region.totalCovered)}
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  AUA {formatCompactCurrency(region.aua)} · AUM{" "}
                  {formatCompactCurrency(region.aum)}
                </p>
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  {region.sharePct}%
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SectionPanel>
  );
}
