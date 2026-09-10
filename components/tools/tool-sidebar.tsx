"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  filterTools,
  groupToolsByCategory,
  type ToolDefinition,
} from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

type ToolSidebarProps = {
  activeToolId: string;
  onSelectTool: (toolId: string) => void;
  className?: string;
};

function ToolNavItem({
  tool,
  isActive,
  onSelect,
}: {
  tool: ToolDefinition;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = tool.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-md py-2 pr-2 pl-2.5 text-left transition-colors",
        isActive
          ? "border-l-2 border-primary bg-muted/60"
          : "border-l-2 border-transparent hover:bg-muted/40",
      )}
    >
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border/60">
        <Icon className="size-3.5" aria-hidden />
      </div>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm leading-tight",
            isActive ? "font-semibold text-foreground" : "font-medium",
          )}
        >
          {tool.label}
        </span>
      </span>
    </button>
  );
}

export function ToolSidebar({
  activeToolId,
  onSelectTool,
  className,
}: ToolSidebarProps) {
  const [query, setQuery] = useState("");
  const filteredTools = useMemo(() => filterTools(query), [query]);
  const groups = useMemo(
    () => groupToolsByCategory(filteredTools),
    [filteredTools],
  );

  return (
    <aside
      className={cn(
        "flex max-h-[min(720px,calc(100vh-10rem))] flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 lg:sticky lg:top-6",
        className,
      )}
    >
      <p className={dashboardTheme.sectionLabel}>Calculators</p>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tools…"
          className="bg-background pl-8"
          aria-label="Search calculators"
        />
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No calculators match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.category} className="space-y-2">
              <div className="border-b border-border/40 pb-2">
                <p className="text-xs font-semibold tracking-tight">
                  {group.label}
                </p>
              </div>
              <div className="space-y-0.5">
                {group.tools.map((tool) => (
                  <ToolNavItem
                    key={tool.id}
                    tool={tool}
                    isActive={activeToolId === tool.id}
                    onSelect={() => onSelectTool(tool.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
