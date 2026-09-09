"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
 * straight into Comms, Service or Compliance. The tab bar scrolls rather than
 * squashing labels, since the workspace has more tabs than the default fits.
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
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={active} onValueChange={(value) => select(value ?? defaultValue)}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-none">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
