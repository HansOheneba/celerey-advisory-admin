"use client";

/**
 * Vendored from @kbqtech/ghana-clickable-map (MIT).
 * In-repo copy avoids stale Next.js peer dependency constraints on Next 16.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import type { Layer, LeafletMouseEvent, Path, PathOptions } from "leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

import geoData from "./ghana-regions.json";
import type { GhanaClickableMapProps, GhanaGeoData, RegionLabels } from "./types";

export const REGION_LABELS: RegionLabels = {
  "Greater Accra": [5.7, 0.1],
  Ashanti: [6.7, -1.5],
  Western: [5.5, -2.2],
  "Western North": [6.2, -2.8],
  Central: [5.5, -1.0],
  Eastern: [6.3, -0.4],
  Volta: [6.5, 0.5],
  Oti: [7.9, 0.2],
  Northern: [9.6, -0.3],
  Savannah: [9.2, -1.7],
  "North East": [10.4, -0.6],
  "Upper East": [10.8, -0.9],
  "Upper West": [10.3, -2.2],
  Bono: [7.6, -2.4],
  "Bono East": [7.9, -1.2],
  Ahafo: [6.9, -2.6],
};

type RegionFeature = Feature<Geometry, GeoJsonProperties & { name?: string }>;

function isPathLayer(layer: Layer): layer is Path {
  return "setStyle" in layer && typeof layer.setStyle === "function";
}

export function GhanaClickableMap({
  regionColors = {},
  defaultColor = "#e5e7eb",
  selectedColor = "#ff9800",
  hoverColor,
  onRegionClick,
  updateUrl = true,
  mapHeight = "600px",
  className = "",
  initialRegion = null,
  style = {},
  disabled = false,
}: GhanaClickableMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedRegion, setSelectedRegion] = useState<string | null>(
    initialRegion ?? (updateUrl ? searchParams.get("region") : null),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!updateUrl) {
      return;
    }

    const currentRegion = searchParams.get("region");

    if (selectedRegion) {
      if (currentRegion !== selectedRegion) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("region", selectedRegion);
        router.push(`?${params.toString()}`, { scroll: false });
      }
      return;
    }

    if (currentRegion) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("region");
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [selectedRegion, router, searchParams, updateUrl]);

  useEffect(() => {
    onRegionClick?.(selectedRegion);
  }, [selectedRegion, onRegionClick]);

  const getRegionColor = useCallback(
    (region: string, isSelected: boolean): string => {
      if (isSelected) {
        return selectedColor;
      }
      if (regionColors[region]) {
        return regionColors[region];
      }
      return defaultColor;
    },
    [regionColors, defaultColor, selectedColor],
  );

  const onEachFeature = useCallback(
    (feature: RegionFeature, layer: Layer) => {
      const region = feature.properties?.name;
      if (!region) {
        return;
      }

      const isSelected =
        selectedRegion !== null &&
        region.toLowerCase() === selectedRegion.toLowerCase();

      const pathStyle: PathOptions = {
        fillColor: getRegionColor(region, isSelected),
        weight: isSelected ? 3 : 2,
        opacity: 1,
        color: isSelected ? selectedColor : "white",
        fillOpacity: 0.7,
      };

      if (isPathLayer(layer)) {
        layer.setStyle(pathStyle);
      }

      if (disabled) {
        layer.bindTooltip(region, {
          sticky: true,
          className: "ghana-map-tooltip",
        });
        return;
      }

      layer.on({
        click: () => {
          setSelectedRegion(isSelected ? null : region);
        },
        mouseover: (event: LeafletMouseEvent) => {
          if (!isSelected && isPathLayer(event.target)) {
            event.target.setStyle({
              fillColor: hoverColor ?? selectedColor,
              fillOpacity: 0.5,
            });
          }
          layer.openTooltip();
        },
        mouseout: (event: LeafletMouseEvent) => {
          if (!isSelected && isPathLayer(event.target)) {
            event.target.setStyle({
              fillColor: getRegionColor(region, false),
              fillOpacity: 0.7,
            });
          }
        },
      });

      layer.bindTooltip(region, {
        sticky: true,
        className: "ghana-map-tooltip",
      });
    },
    [selectedRegion, getRegionColor, selectedColor, hoverColor, disabled],
  );

  const ghanaBounds = new LatLngBounds([4.7, -3.5], [11.2, 1.2]);

  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`}
        style={{ height: mapHeight, ...style }}
      >
        <div className="animate-pulse text-gray-500">Loading map…</div>
      </div>
    );
  }

  return (
    <div
      className={`ghana-clickable-map-container ${className}`}
      style={{ height: mapHeight, ...style }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-white shadow-md">
        <MapContainer
          center={[7.9465, -1.0232]}
          zoom={6.5}
          style={{ height: "100%", width: "100%" }}
          bounds={ghanaBounds}
          maxBounds={ghanaBounds}
          attributionControl={false}
          minZoom={6}
          maxZoom={7}
          boundsOptions={{ padding: [5, 5] }}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={!disabled}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          <GeoJSON
            key={selectedRegion ?? "none"}
            data={geoData as GhanaGeoData}
            onEachFeature={onEachFeature}
            style={{ weight: 2, opacity: 1, color: "white", fillOpacity: 0.7 }}
          />
        </MapContainer>
      </div>

      <style>{`
        .ghana-clickable-map-container .map-tiles {
          filter: grayscale(100%) brightness(0.9);
        }

        .ghana-clickable-map-container .leaflet-container {
          background: #f8fafc;
        }

        .ghana-clickable-map-container .leaflet-tile-pane {
          display: none !important;
        }

        .ghana-clickable-map-container .leaflet-control-container {
          display: none !important;
        }

        .ghana-clickable-map-container .leaflet-interactive {
          cursor: ${disabled ? "default" : "pointer"};
          transition: fill-opacity 0.2s ease;
        }

        .ghana-clickable-map-container .leaflet-interactive:focus {
          outline: none !important;
        }

        .ghana-clickable-map-container .ghana-map-tooltip {
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .ghana-clickable-map-container .leaflet-tooltip-left.ghana-map-tooltip::before,
        .ghana-clickable-map-container .leaflet-tooltip-right.ghana-map-tooltip::before {
          border-left-color: rgba(0, 0, 0, 0.8);
          border-right-color: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
}
