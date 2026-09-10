import type { FeatureCollection } from "geojson";

export interface GhanaClickableMapProps {
  regionColors?: { [region: string]: string };
  defaultColor?: string;
  selectedColor?: string;
  hoverColor?: string;
  onRegionClick?: (region: string | null) => void;
  updateUrl?: boolean;
  mapHeight?: string;
  className?: string;
  showLabels?: boolean;
  initialRegion?: string | null;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export interface RegionLabels {
  [region: string]: [number, number];
}

export type GhanaRegion =
  | "Greater Accra"
  | "Ashanti"
  | "Western"
  | "Western North"
  | "Central"
  | "Eastern"
  | "Volta"
  | "Oti"
  | "Northern"
  | "Savannah"
  | "North East"
  | "Upper East"
  | "Upper West"
  | "Bono"
  | "Bono East"
  | "Ahafo";

export type GhanaGeoData = FeatureCollection;
