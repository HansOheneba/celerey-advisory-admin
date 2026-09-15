"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { headingTitle } from "@/lib/format";

export type WorkspaceTabDefinition = {
  value: string;
  label: string;
  content: React.ReactNode;
};

type WorkspaceTabsProps = {
  tabs: WorkspaceTabDefinition[];
  defaultValue: string;
};

/**
 * The active tab lives in the URL so alerts and quick actions can deep-link
 * into Goals, Advisory, or Compliance. The tab bar scrolls rather than
 * squashing labels — the workspace has more tabs than fit on one row.
 */
export function WorkspaceTabs({ tabs, defaultValue }: WorkspaceTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get("tab");
  const active = tabs.some((tab) => tab.value === requested)
    ? (requested as string)
    : defaultValue;

  function select(value: string) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    if (value !== "advisory") {
      next.delete("advisory");
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={active} onValueChange={(value) => select(value ?? defaultValue)}>
      <div className="-mx-1 overflow-x-auto scrollbar-none">
        <TabsList className="inline-flex w-max min-w-full justify-start gap-0.5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-none">
              {headingTitle(tab.label)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
