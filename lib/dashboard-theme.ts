export const dashboardTheme = {
  /** Page sections stack with space-y-6; metric grids use gap-4 (see StatGrid). */
  page: "w-full min-w-0 space-y-6 lg:space-y-8 celerey-stagger",
  pageContainer: "w-full min-w-0 space-y-6 lg:space-y-8 celerey-stagger",
  pageContainerNarrow:
    "mx-auto w-full min-w-0 max-w-3xl space-y-6 lg:space-y-8 celerey-stagger",
  surface: "bg-background",
  sectionLabel:
    "text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
  pageTitle: "text-xl font-medium tracking-tight sm:text-2xl",
  pageDescription: "text-sm text-muted-foreground max-w-3xl leading-relaxed",
  sectionTitle: "text-sm font-medium",
  sectionDescription: "text-xs text-muted-foreground",
  card: "rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 shadow-none transition-colors",
  kpiCard:
    "rounded-xl bg-card p-4 text-card-foreground ring-1 ring-foreground/10 shadow-none",
  elevatedSection:
    "rounded-xl bg-card px-5 py-4 ring-1 ring-foreground/10 sm:px-5 sm:py-5",
  openSection: "space-y-4",
  tableShell:
    "overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
  emptyState:
    "rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center",
  section:
    "rounded-xl bg-card px-5 py-4 ring-1 ring-foreground/10 transition-colors sm:px-5 sm:py-5",
  sectionHeader: "border-b border-border px-5 py-4",
  sectionBody: "p-5",
  surfaceMuted: "bg-surface-muted",
  tintedSurface: {
    brand: "bg-surface-brand border-primary/10",
    success: "bg-surface-success border-success/15",
    warning: "bg-surface-warning border-warning/15",
    info: "bg-surface-info border-accent-blue/15",
    ai: "bg-surface-ai border-accent-purple/15",
    muted: "bg-surface-muted border-border/40",
  },
  iconTile:
    "flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-brand text-primary",
  iconTileSuccess:
    "flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-success text-success",
  iconTileWarning:
    "flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-warning text-warning",
  iconTileInfo:
    "flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-info text-accent-blue",
  iconTileAi:
    "flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-ai text-accent-purple",
  statLabel: "text-xs text-muted-foreground",
  statValue: "text-sm font-medium text-foreground",
  statValueLarge:
    "text-2xl font-medium tracking-tight tabular-nums text-foreground",
  listRow:
    "flex items-start gap-3 border-b border-border px-1 py-3 last:border-b-0 transition-colors hover:bg-muted/30",
  callout:
    "rounded-lg border-l-[3px] border-primary bg-surface-brand px-4 py-3",
  calloutAi:
    "rounded-lg border-l-[3px] border-accent-purple bg-surface-ai px-4 py-3",
  filterBar:
    "rounded-xl border border-primary/10 bg-surface-brand px-4 py-3 sm:px-5",
} as const;

export type TintedSurfaceVariant = keyof typeof dashboardTheme.tintedSurface;
