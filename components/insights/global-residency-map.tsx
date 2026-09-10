"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionPanel } from "@/components/shared/section-panel";
import { formatCompactCurrency } from "@/lib/format";
import type { ResidencySpread } from "@/lib/overview/book-analytics";
import {
  countryAtlasName,
  countryFlag,
} from "@/lib/geo/country-registry";
import {
  GHANA_MAP_THEME,
  globalCountryColorForShare,
} from "@/lib/overview/ghana-map-colors";
import { cn } from "@/lib/utils";

const WORLD_TOPO =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MAP = {
  ocean: "#c8d4e3",
  land: GHANA_MAP_THEME.defaultColor,
  landStroke: "#475569",
  bookStroke: "#1e293b",
} as const;

type GlobalResidencyMapProps = {
  spread: ResidencySpread;
};

export function GlobalResidencyMap({ spread }: GlobalResidencyMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const clientCount = spread.countries.reduce(
    (total, entry) => total + entry.clientCount,
    0,
  );

  const countryByAtlasName = useMemo(() => {
    const map = new Map<string, { country: string; sharePct: number }>();

    for (const entry of spread.countries) {
      const atlasName = countryAtlasName(entry.country) ?? entry.country;
      map.set(atlasName, {
        country: entry.country,
        sharePct: entry.sharePct,
      });
    }

    return map;
  }, [spread.countries]);

  if (spread.countryCount === 0) {
    return (
      <SectionPanel
        title="Global client residency"
        description="Where clients in your book are resident."
      >
        <EmptyState
          icon={Globe}
          title="No residency data"
          description="Client country of residence appears here when available."
        />
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Global client residency"
      description={`${clientCount} clients · ${formatCompactCurrency(spread.totalAua)} AUA · ${spread.countryCount} countries`}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div
          className={cn(
            "relative min-h-[300px] overflow-hidden rounded-lg border border-border/70",
            !mapReady && "animate-pulse bg-muted/30",
          )}
          style={{ backgroundColor: MAP.ocean }}
        >
          {mapReady ? (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [0, 18], scale: 105 }}
              width={960}
              height={320}
              className="h-full w-full"
            >
              <Geographies geography={WORLD_TOPO}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const featureName = String(geo.properties?.name ?? "");
                    const bookCountry = countryByAtlasName.get(featureName);
                    const isHovered =
                      activeCountry !== null &&
                      countryAtlasName(activeCountry) === featureName;

                    const fill = bookCountry
                      ? isHovered
                        ? GHANA_MAP_THEME.selectedColor
                        : globalCountryColorForShare(bookCountry.sharePct)
                      : MAP.land;
                    const stroke = bookCountry ? MAP.bookStroke : MAP.landStroke;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={bookCountry ? (isHovered ? 1.1 : 0.85) : 0.55}
                        className={cn(
                          "outline-none transition-[fill,stroke,stroke-width] duration-150",
                          bookCountry && "cursor-pointer",
                        )}
                        onMouseEnter={() => {
                          if (bookCountry) {
                            setActiveCountry(bookCountry.country);
                          }
                        }}
                        onMouseLeave={() => {
                          setActiveCountry(null);
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          ) : null}
        </div>

        <div className="min-h-[300px] max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {spread.countries.map((entry) => {
            const isActive = activeCountry === entry.country;

            return (
              <button
                key={entry.country}
                type="button"
                className={cn(
                  "w-full rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-colors",
                  isActive
                    ? "border-primary/35 ring-1 ring-primary/15"
                    : "border-border/60 hover:bg-muted/30",
                )}
                onMouseEnter={() => setActiveCountry(entry.country)}
                onMouseLeave={() => setActiveCountry(null)}
                onFocus={() => setActiveCountry(entry.country)}
                onBlur={() => setActiveCountry(null)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      <span className="mr-1.5" aria-hidden>
                        {countryFlag(entry.country)}
                      </span>
                      {entry.country}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.clientCount} client
                      {entry.clientCount === 1 ? "" : "s"} · {entry.sharePct}%
                      of book
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums tracking-tight">
                    {formatCompactCurrency(entry.aua)}
                  </p>
                </div>

                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">AUA</dt>
                    <dd className="font-medium tabular-nums text-foreground">
                      {formatCompactCurrency(entry.aua)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">AUM</dt>
                    <dd className="font-medium tabular-nums text-foreground">
                      {formatCompactCurrency(entry.aum)}
                    </dd>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>
      </div>
    </SectionPanel>
  );
}
