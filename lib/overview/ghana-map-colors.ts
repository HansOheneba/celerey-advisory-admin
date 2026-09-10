/** Choropleth fill colors aligned with the dashboard palette. */
export function ghanaRegionColorForShare(sharePct: number): string {
  if (sharePct >= 50) {
    return "#3d5a80";
  }
  if (sharePct >= 20) {
    return "#5a7394";
  }
  if (sharePct >= 5) {
    return "#a8bacf";
  }
  if (sharePct > 0) {
    return "#c5d0dc";
  }
  return "#dce4ef";
}

export const GHANA_MAP_THEME = {
  defaultColor: "#e8edf4",
  selectedColor: "#151339",
  hoverColor: "#4a6585",
} as const;

/** World choropleth — darker floor so small book countries read against neutral land. */
export function globalCountryColorForShare(sharePct: number): string {
  if (sharePct >= 50) {
    return "#2f4f72";
  }
  if (sharePct >= 20) {
    return "#4a6585";
  }
  if (sharePct >= 5) {
    return "#66809e";
  }
  if (sharePct > 0) {
    return "#849cb5";
  }
  return GHANA_MAP_THEME.defaultColor;
}
