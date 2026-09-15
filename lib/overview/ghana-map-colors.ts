import { brandColors } from "@/lib/brand";

/** Choropleth fill colors — Fidelity palette only. */
export function ghanaRegionColorForShare(sharePct: number): string {
  if (sharePct >= 50) {
    return brandColors.black;
  }
  if (sharePct >= 20) {
    return brandColors.brown;
  }
  if (sharePct >= 5) {
    return brandColors.orange;
  }
  if (sharePct > 0) {
    return brandColors.cream;
  }
  return brandColors.white;
}

export const GHANA_MAP_THEME = {
  defaultColor: brandColors.cream,
  selectedColor: brandColors.orange,
  hoverColor: brandColors.brown,
} as const;

/** World choropleth — darker floor so small book countries read against neutral land. */
export function globalCountryColorForShare(sharePct: number): string {
  if (sharePct >= 50) {
    return brandColors.black;
  }
  if (sharePct >= 20) {
    return brandColors.brown;
  }
  if (sharePct >= 5) {
    return brandColors.orange;
  }
  if (sharePct > 0) {
    return brandColors.cream;
  }
  return GHANA_MAP_THEME.defaultColor;
}
