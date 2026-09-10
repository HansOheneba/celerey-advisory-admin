"use client";

import {
  Banknote,
  BarChart3,
  Building2,
  Gem,
  Landmark,
  Layers,
  Shield,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency, titleCase } from "@/lib/format";
import {
  PRODUCT_CATEGORY_LABELS,
  type DemoProduct,
  type ProductCategory,
} from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const RISK_ORDER: Record<DemoProduct["riskBand"], number> = {
  conservative: 0,
  moderate: 1,
  growth: 2,
  aggressive: 3,
};

const RISK_BADGE_STYLES: Record<DemoProduct["riskBand"], string> = {
  conservative: "border-border/60 bg-muted/40 text-muted-foreground",
  moderate: "border-border/60 bg-muted/40 text-foreground",
  growth: "border-border/60 bg-muted/40 text-foreground",
  aggressive: "border-border/60 bg-muted/40 text-foreground font-medium",
};

const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  funds: Layers,
  fixed_income: Landmark,
  equities: TrendingUp,
  structured: BarChart3,
  alternatives: Gem,
  private_markets: Building2,
  lending: Banknote,
  insurance: Shield,
  cash: Banknote,
};

type ProductsViewProps = {
  products: DemoProduct[];
};

export function ProductsView({ products }: ProductsViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [risk, setRisk] = useState<DemoProduct["riskBand"] | "all">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return products
      .filter((product) =>
        category === "all" ? true : product.category === category,
      )
      .filter((product) => (risk === "all" ? true : product.riskBand === risk))
      .filter((product) =>
        needle
          ? `${product.name} ${product.provider} ${product.summary}`
              .toLowerCase()
              .includes(needle)
          : true,
      )
      .sort(
        (a, b) =>
          RISK_ORDER[a.riskBand] - RISK_ORDER[b.riskBand] ||
          b.returnPct - a.returnPct,
      );
  }, [products, query, category, risk]);

  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow="Products"
        title="Investment, lending and protection catalogue"
        description="Catalogue of what you can recommend and the restrictions that apply."
        icon={Layers}
      />

      <div
        className={cn(
          dashboardTheme.elevatedSection,
          "flex flex-wrap gap-2",
        )}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products or providers"
          className="max-w-xs bg-background"
          aria-label="Search products"
        />

        <Select
          value={category}
          onValueChange={(value) =>
            setCategory(value as ProductCategory | "all")
          }
        >
          <SelectTrigger className="w-48 bg-background" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(PRODUCT_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={risk}
          onValueChange={(value) =>
            setRisk(value as DemoProduct["riskBand"] | "all")
          }
        >
          <SelectTrigger className="w-44 bg-background" aria-label="Filter by risk band">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All risk bands</SelectItem>
            {Object.keys(RISK_ORDER).map((band) => (
              <SelectItem key={band} value={band}>
                {titleCase(band)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} product{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No products match your filters"
          description="Try adjusting the category, risk band, or search term."
        />
      ) : (
        <div className="space-y-6">
          {groupProductsByCategory(filtered).map(([categoryKey, group]) => (
            <SectionPanel
              key={categoryKey}
              title={PRODUCT_CATEGORY_LABELS[categoryKey]}
              description={`${group.length} product${group.length === 1 ? "" : "s"}`}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </SectionPanel>
          ))}
        </div>
      )}
    </div>
  );
}

function groupProductsByCategory(
  products: DemoProduct[],
): Array<[ProductCategory, DemoProduct[]]> {
  const groups = new Map<ProductCategory, DemoProduct[]>();

  for (const product of products) {
    const existing = groups.get(product.category);
    if (existing) {
      existing.push(product);
    } else {
      groups.set(product.category, [product]);
    }
  }

  return [...groups.entries()];
}

function ProductCard({ product }: { product: DemoProduct }) {
  const CategoryIcon = CATEGORY_ICONS[product.category];

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
            <CategoryIcon className="size-[18px]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {PRODUCT_CATEGORY_LABELS[product.category]}
              </Badge>
              <Badge
                variant="outline"
                className={RISK_BADGE_STYLES[product.riskBand]}
              >
                {titleCase(product.riskBand)}
              </Badge>
              {!product.available ? (
                <Badge variant="destructive">Closed</Badge>
              ) : null}
            </div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.provider}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.summary}
        </p>

        <StatGrid columns={2} className="gap-3 border-t border-border pt-3">
          <StatItem
            label="Return TTM"
            value={`${product.returnPct >= 0 ? "+" : ""}${product.returnPct.toFixed(1)}%`}
          />
          <StatItem
            label="Annualised"
            value={`${product.annualisedPct.toFixed(1)}%`}
          />
          <StatItem label="Fee" value={`${product.feePct.toFixed(2)}%`} />
          <StatItem
            label="Minimum"
            value={formatCompactCurrency(product.minimumUsd)}
          />
          <StatItem label="Liquidity" value={titleCase(product.liquidity)} />
          <StatItem label="Currency" value={product.currency} />
        </StatGrid>

        {product.restrictions.length > 0 ? (
          <div className="space-y-1 border-t border-border pt-3">
            <p className={dashboardTheme.statLabel}>Restrictions</p>
            <ul className="space-y-0.5 text-xs leading-relaxed text-muted-foreground">
              {product.restrictions.map((restriction) => (
                <li key={restriction}>· {restriction}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
