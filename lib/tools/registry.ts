import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Clock,
  GraduationCap,
  Home,
  Landmark,
  PiggyBank,
  Scale,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";

export type ToolCategory =
  | "retirement"
  | "portfolio"
  | "ghana"
  | "credit";

export const TOOL_CATEGORY_META: Record<
  ToolCategory,
  { label: string; description: string; order: number }
> = {
  retirement: {
    label: "Life & retirement",
    description: "",
    order: 0,
  },
  portfolio: {
    label: "Portfolio & liquidity",
    description: "",
    order: 1,
  },
  ghana: {
    label: "Ghana markets",
    description: "",
    order: 2,
  },
  credit: {
    label: "Credit & property",
    description: "",
    order: 3,
  },
};

export type ToolDefinition = {
  id: string;
  label: string;
  category: ToolCategory;
  description: string;
  icon: LucideIcon;
  variant: "brand" | "info" | "success" | "warning";
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "retirement",
    label: "Retirement",
    category: "retirement",
    description: "Pot vs income need",
    icon: Clock,
    variant: "brand",
  },
  {
    id: "goal",
    label: "Goal funding",
    category: "retirement",
    description: "Hit the target on time",
    icon: Target,
    variant: "success",
  },
  {
    id: "education",
    label: "Education",
    category: "retirement",
    description: "Fees with inflation",
    icon: GraduationCap,
    variant: "success",
  },
  {
    id: "withdrawal",
    label: "Withdrawal stress",
    category: "retirement",
    description: "Survive withdrawals",
    icon: Shield,
    variant: "warning",
  },
  {
    id: "cash",
    label: "Cash deployment",
    category: "portfolio",
    description: "Cost of idle cash",
    icon: PiggyBank,
    variant: "info",
  },
  {
    id: "emergency",
    label: "Emergency fund",
    category: "portfolio",
    description: "Months of cover",
    icon: Shield,
    variant: "info",
  },
  {
    id: "rebalance",
    label: "Rebalance",
    category: "portfolio",
    description: "Trade size and cost",
    icon: Scale,
    variant: "info",
  },
  {
    id: "fx",
    label: "FX exposure",
    category: "ghana",
    description: "Cedi shock on GHS spend",
    icon: TrendingUp,
    variant: "brand",
  },
  {
    id: "tbill",
    label: "T-Bill ladder",
    category: "ghana",
    description: "T-bills vs call",
    icon: Landmark,
    variant: "brand",
  },
  {
    id: "tax-equiv",
    label: "Tax-equiv. yield",
    category: "ghana",
    description: "T-bill vs taxable",
    icon: Banknote,
    variant: "info",
  },
  {
    id: "lending",
    label: "Lombard capacity",
    category: "credit",
    description: "Borrow against portfolio",
    icon: Home,
    variant: "warning",
  },
  {
    id: "property",
    label: "Property equity",
    category: "credit",
    description: "Property + Lombard",
    icon: Home,
    variant: "warning",
  },
  {
    id: "mortgage",
    label: "Mortgage vs invest",
    category: "credit",
    description: "Pay down or invest",
    icon: Scale,
    variant: "warning",
  },
];

export type ToolCategoryGroup = {
  category: ToolCategory;
  label: string;
  description: string;
  tools: ToolDefinition[];
};

export function groupToolsByCategory(
  tools: ToolDefinition[] = TOOL_DEFINITIONS,
): ToolCategoryGroup[] {
  const grouped = new Map<ToolCategory, ToolDefinition[]>();

  for (const tool of tools) {
    const list = grouped.get(tool.category) ?? [];
    list.push(tool);
    grouped.set(tool.category, list);
  }

  return (Object.keys(TOOL_CATEGORY_META) as ToolCategory[])
    .sort(
      (left, right) =>
        TOOL_CATEGORY_META[left].order - TOOL_CATEGORY_META[right].order,
    )
    .flatMap((category) => {
      const categoryTools = grouped.get(category);
      if (!categoryTools?.length) {
        return [];
      }

      return [
        {
          category,
          label: TOOL_CATEGORY_META[category].label,
          description: TOOL_CATEGORY_META[category].description,
          tools: categoryTools,
        },
      ];
    });
}

export function filterTools(query: string): ToolDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return TOOL_DEFINITIONS;
  }

  return TOOL_DEFINITIONS.filter((tool) => {
    const categoryLabel = TOOL_CATEGORY_META[tool.category].label.toLowerCase();
    return (
      tool.label.toLowerCase().includes(normalized) ||
      tool.description.toLowerCase().includes(normalized) ||
      categoryLabel.includes(normalized)
    );
  });
}
