"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency, headingTitle } from "@/lib/format";
import type { GeographicSpread } from "@/lib/overview/book-analytics";
import { cn } from "@/lib/utils";
import { brandColors } from "@/lib/brand";

const WORLD_TOPO =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MAP_WIDTH = 960;
const MAP_HEIGHT = 320;

/** High-contrast fills so country borders read clearly on screen. */
const MAP = {
  ocean: brandColors.cream,
  land: brandColors.white,
  landStroke: brandColors.brown,
  activeLand: brandColors.orange,
  activeStroke: brandColors.black,
} as const;

type GeographicSpreadCompactProps = {
  spread: GeographicSpread;
};

type GeographicSpreadMapProps = {
  spread: GeographicSpread;
  activeIso3: Set<string>;
};

/**
 * react-simple-maps projection math differs slightly between Node and the
 * browser, so the map is rendered only after mount to avoid hydration mismatch.
 */
function GeographicSpreadMap({ spread, activeIso3 }: GeographicSpreadMapProps) {
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        scale: 148,
        center: [10, 18],
      }}
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      className="block h-full w-full"
    >
      <rect
        x={0}
        y={0}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        fill={MAP.ocean}
      />
      <Geographies geography={WORLD_TOPO}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const props = geo.properties ?? {};
            const iso3 = String(
              props.iso_a3 ?? props.ISO_A3 ?? "",
            ).toUpperCase();
            const isActive = activeIso3.has(iso3);

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isActive ? MAP.activeLand : MAP.land}
                stroke={isActive ? MAP.activeStroke : MAP.landStroke}
                strokeWidth={isActive ? 0.85 : 0.65}
                className="outline-none"
              />
            );
          })
        }
      </Geographies>

      {spread.markers.map((marker) => {
        const isHovered = hoveredMarkerId === marker.id;
        const radius = Math.max(
          4,
          Math.min(9, 4 + Math.log10(marker.value / 500_000)),
        );

        return (
          <Marker key={marker.id} coordinates={marker.coordinates}>
            <g
              onMouseEnter={() => setHoveredMarkerId(marker.id)}
              onMouseLeave={() => setHoveredMarkerId(null)}
              className="cursor-pointer"
            >
              <circle
                r={radius + 4}
                fill="var(--primary)"
                opacity={isHovered ? 0.35 : 0.2}
              />
              <circle
                r={radius}
                fill="var(--primary)"
                stroke="white"
                strokeWidth={2}
              />
              {isHovered ? (
                <title>
                  {marker.name} · {marker.city}, {marker.country} ·{" "}
                  {formatCompactCurrency(marker.value)}
                </title>
              ) : null}
            </g>
          </Marker>
        );
      })}
    </ComposableMap>
  );
}

export function GeographicSpreadCompact({
  spread,
}: GeographicSpreadCompactProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const activeIso3 = useMemo(
    () =>
      new Set(
        spread.countries
          .map((country) => country.iso3?.toUpperCase())
          .filter(Boolean) as string[],
      ),
    [spread.countries],
  );

  return (
    <section
      className={cn(
        dashboardTheme.elevatedSection,
        dashboardTheme.tintedSurface.brand,
        "space-y-5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className={dashboardTheme.sectionTitle}>
            {headingTitle("Geographic spread")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {spread.propertyCount > 0
              ? `${formatCompactCurrency(spread.totalPropertyValue)} across ${spread.propertyCount} ${spread.propertyCount === 1 ? "property" : "properties"}`
              : "Property locations across your book."}
          </p>
        </div>
        {spread.countryCount > 0 ? (
          <Badge
            variant="outline"
            className="border-primary/20 bg-background/70"
          >
            {spread.countryCount}{" "}
            {spread.countryCount === 1 ? "country" : "countries"}
          </Badge>
        ) : null}
      </div>

      {spread.propertyCount === 0 ? (
        <EmptyState
          icon={Globe}
          title="No property locations"
          description="Property records with country and city appear here."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="order-2 overflow-hidden rounded-xl border border-primary/20 bg-background shadow-none lg:order-1">
            <div
              className="aspect-3/1 max-h-28 w-full sm:max-h-36 md:max-h-44 lg:max-h-none"
              aria-hidden={!mapReady}
            >
              {mapReady ? (
                <GeographicSpreadMap spread={spread} activeIso3={activeIso3} />
              ) : (
                <div className="h-full w-full animate-pulse bg-muted/50" />
              )}
            </div>
          </div>

          <div className="order-1 space-y-4 border-primary/10 lg:order-2 lg:border-l lg:pl-5">
            {spread.countries.map((country) => (
              <div key={country.country} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2 text-sm">
                  <span className="font-medium leading-snug">
                    <span className="mr-1.5" aria-hidden>
                      {country.flag}
                    </span>
                    {country.country}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({country.clientCount}{" "}
                      {country.clientCount === 1 ? "client" : "clients"})
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {country.sharePct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-background/80">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(country.sharePct, 2)}%` }}
                  />
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatCompactCurrency(country.valueUsd)}
                  {country.propertyCount > 0
                    ? ` · ${country.propertyCount} ${country.propertyCount === 1 ? "property" : "properties"}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
