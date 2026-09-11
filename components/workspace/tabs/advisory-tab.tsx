"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CommsTab } from "@/components/workspace/tabs/comms-tab";
import { ServiceTab } from "@/components/workspace/tabs/service-tab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { Appointment } from "@/lib/appointments/types";
import type { ClientAvailability } from "@/lib/availability/types";
import type { ClientDocument } from "@/lib/documents/types";
import type { ConversationThread } from "@/lib/messages/types";
import type { Task } from "@/lib/tasks/types";
import type { DemoReportRecord, DemoServiceRequest } from "@/lib/demo/types";

const ADVISORY_VIEWS = ["sessions", "tasks", "messages", "documents"] as const;
type AdvisoryView = (typeof ADVISORY_VIEWS)[number];

function isAdvisoryView(value: string | null): value is AdvisoryView {
  return ADVISORY_VIEWS.includes(value as AdvisoryView);
}

type AdvisoryTabProps = {
  clientId: string;
  clientName: string;
  thread: ConversationThread | null;
  documents: ClientDocument[];
  reports: DemoReportRecord[];
  serviceRequests: DemoServiceRequest[];
  tasks: Task[];
  appointments: Appointment[];
  availability: ClientAvailability;
  canMessage: boolean;
  canManageDocuments: boolean;
  canGenerateReport: boolean;
};

export function AdvisoryTab({
  clientId,
  clientName,
  thread,
  documents,
  reports,
  serviceRequests,
  tasks,
  appointments,
  availability,
  canMessage,
  canManageDocuments,
  canGenerateReport,
}: AdvisoryTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("advisory");
  const active = isAdvisoryView(requested) ? requested : "sessions";

  function select(view: AdvisoryView) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", "advisory");
    next.set("advisory", view);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const openTasks = tasks.filter((task) => task.status === "open");

  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        if (isAdvisoryView(value)) {
          select(value);
        }
      }}
    >
      <div className="-mx-1 overflow-x-auto scrollbar-none">
        <TabsList className="inline-flex w-max min-w-full justify-start">
          <TabsTrigger value="sessions" className="flex-none">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-none">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex-none">
            Messages
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-none">
            Documents
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="sessions">
        <ServiceTab
          clientId={clientId}
          documents={[]}
          reports={reports}
          serviceRequests={serviceRequests}
          tasks={[]}
          appointments={appointments}
          availability={availability}
          canManageDocuments={false}
          canGenerateReport={canGenerateReport}
          sessionsOnly
        />
      </TabsContent>

      <TabsContent value="tasks">
        <ServiceTab
          clientId={clientId}
          documents={[]}
          reports={[]}
          serviceRequests={[]}
          tasks={tasks}
          appointments={[]}
          availability={availability}
          canManageDocuments={false}
          canGenerateReport={false}
          tasksOnly
        />
      </TabsContent>

      <TabsContent value="messages">
        <CommsTab
          clientId={clientId}
          clientName={clientName}
          thread={thread}
          canMessage={canMessage}
        />
      </TabsContent>

      <TabsContent value="documents">
        <ServiceTab
          clientId={clientId}
          documents={documents}
          reports={[]}
          serviceRequests={[]}
          tasks={[]}
          appointments={[]}
          availability={availability}
          canManageDocuments={canManageDocuments}
          canGenerateReport={false}
          documentsOnly
        />
      </TabsContent>

      {openTasks.length > 0 && active !== "tasks" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {openTasks.length} open task{openTasks.length === 1 ? "" : "s"}. See
          Tasks.
        </p>
      ) : null}
    </Tabs>
  );
}
