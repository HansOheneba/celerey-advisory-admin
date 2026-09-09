export const dashboardTheme = {
  /** Page sections stack with space-y-6; metric grids use gap-4 (see StatGrid). */
  page: "w-full px-4 py-5 sm:px-6 sm:py-6 space-y-6 celerey-stagger",
  pageContainer:
    "w-full max-w-[1400px] mx-auto px-4 py-5 sm:px-6 sm:py-6 space-y-6 celerey-stagger",
  pageContainerNarrow:
    "w-full max-w-[1100px] mx-auto px-4 py-5 sm:px-6 sm:py-6 space-y-6 celerey-stagger",
  surface: "dashboard-surface",
  sectionLabel:
    "text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
  pageTitle: "text-xl font-semibold tracking-tight sm:text-2xl",
  pageDescription: "text-sm text-muted-foreground max-w-xl",
  card: "bg-card border border-border/50 shadow-none transition-colors hover:border-border/80",
  kpiCard: "bg-card border border-border/50 shadow-none",
  tableShell: "bg-card border border-border/50 overflow-hidden rounded-xl",
  emptyState:
    "rounded-xl border border-dashed border-border/70 bg-surface-brand px-6 py-10 text-center",
  section:
    "rounded-xl border border-border/50 px-4 py-4 transition-colors hover:border-border/70 sm:px-5 sm:py-5",
  surfaceMuted: "bg-surface-muted",
  tintedSurface: {
    brand: "bg-surface-brand border-primary/10",
    success: "bg-surface-success border-emerald-500/15",
    warning: "bg-surface-warning border-amber-500/15",
    info: "bg-surface-info border-blue-500/15",
    ai: "bg-surface-ai border-[var(--accent-purple)]/15",
    muted: "bg-surface-muted border-border/40",
  },
  iconTile:
    "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
  iconTileSuccess:
    "flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700",
  iconTileWarning:
    "flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700",
  iconTileInfo:
    "flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700",
  iconTileAi:
    "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]",
  statLabel:
    "text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
  statValue: "text-sm font-medium text-foreground",
  statValueLarge: "text-2xl font-semibold tracking-tight text-foreground",
  listRow:
    "flex items-start gap-3 border-b border-border/50 px-1 py-3 last:border-b-0 transition-colors hover:bg-muted/30",
  callout:
    "rounded-lg border-l-[3px] border-primary bg-surface-brand px-4 py-3",
  calloutAi:
    "rounded-lg border-l-[3px] border-[var(--accent-purple)] bg-surface-ai px-4 py-3",
  filterBar:
    "rounded-xl border border-primary/10 bg-surface-brand px-4 py-3 sm:px-5",
} as const;

export type TintedSurfaceVariant = keyof typeof dashboardTheme.tintedSurface;
