"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { bulkAssignClientsAction } from "@/app/actions/assignments";
import { AdvisorSelect } from "@/components/advisors/advisor-select";
import { AssignAdvisorControl } from "@/components/clients/assign-advisor-control";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  advisorInitials,
  advisorWorkloadLabel,
} from "@/lib/advisors/assignable";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatDate, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Advisor } from "@/types/advisor";
import type { Client } from "@/types/client";

type AssignmentsWorkspaceProps = {
  unassignedClients: Client[];
  advisors: Advisor[];
};

export function AssignmentsWorkspace({
  unassignedClients,
  advisors,
}: AssignmentsWorkspaceProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAdvisorId, setBulkAdvisorId] = useState("");
  const [state, action, pending] = useActionState(
    bulkAssignClientsAction,
    undefined,
  );

  useEffect(() => {
    if (!state?.message) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      setSelected(new Set());
      setBulkAdvisorId("");
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const advisorsByCapacity = useMemo(
    () => [...advisors].sort((a, b) => a.clientCount - b.clientCount),
    [advisors],
  );

  const heaviestBook = useMemo(
    () => Math.max(1, ...advisors.map((advisor) => advisor.clientCount)),
    [advisors],
  );

  const bulkAdvisor = advisors.find((advisor) => advisor.id === bulkAdvisorId);

  function toggleClient(clientId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) =>
      current.size === unassignedClients.length
        ? new Set()
        : new Set(unassignedClients.map((client) => client.id)),
    );
  }

  const allSelected =
    unassignedClients.length > 0 && selected.size === unassignedClients.length;

  return (
    <div className={dashboardTheme.page}>
      <section className="space-y-0.5">
        <p className={dashboardTheme.sectionLabel}>Team</p>
        <h2 className={dashboardTheme.pageTitle}>Assignments</h2>
        <p className={dashboardTheme.pageDescription}>
          Give each unassigned client an advisor. Pick one in the row, or
          select several and assign them together.
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,1fr)]">
        <Card className={dashboardTheme.card}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <p className={dashboardTheme.sectionLabel}>Inbox</p>
              <CardTitle className="text-base font-semibold">
                Clients without an advisor
              </CardTitle>
            </div>
            <Badge variant="secondary">{unassignedClients.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {unassignedClients.length === 0 ? (
              <div className={dashboardTheme.emptyState}>
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-medium">Every client has an advisor</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    New unassigned clients will show up here.
                  </p>
                </div>
              </div>
            ) : (
              <div className={dashboardTheme.tableShell}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleAll}
                          aria-label="Select all unassigned clients"
                        />
                      </TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Joined
                      </TableHead>
                      <TableHead className="w-56">Assign to</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(client.id)}
                            onCheckedChange={() => toggleClient(client.id)}
                            aria-label={`Select ${client.firstName} ${client.lastName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(client.firstName, client.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {client.firstName} {client.lastName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {client.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {formatDate(client.joinedAt)}
                        </TableCell>
                        <TableCell>
                          <AssignAdvisorControl
                            clientId={client.id}
                            advisorId={client.advisorId}
                            advisors={advisorsByCapacity}
                            compact
                            allowUnassigned={false}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Capacity</p>
            <CardTitle className="text-base font-semibold">
              Lightest books first
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pick who should take the selected clients.
            </p>
          </CardHeader>
          <CardContent className="space-y-1">
            {advisorsByCapacity.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Add advisors before assigning clients.
              </p>
            ) : (
              advisorsByCapacity.map((advisor) => {
                const isActive = bulkAdvisorId === advisor.id;
                const loadPercent = Math.round(
                  (advisor.clientCount / heaviestBook) * 100,
                );

                return (
                  <button
                    key={advisor.id}
                    type="button"
                    onClick={() => setBulkAdvisorId(advisor.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out)] outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]",
                      isActive && "bg-muted",
                    )}
                  >
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {advisorInitials(advisor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {advisor.name}
                        </p>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {advisorWorkloadLabel(advisor.clientCount)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${loadPercent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {selected.size > 0 ? (
        <form
          action={action}
          className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-popover/95 p-3 shadow-md ring-1 ring-foreground/10 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-[var(--duration-fast)] ease-[var(--ease-out)] motion-reduce:animate-none"
        >
          {Array.from(selected).map((clientId) => (
            <input key={clientId} type="hidden" name="clientIds" value={clientId} />
          ))}
          <p className="text-sm font-medium">
            {selected.size} selected
          </p>
          <AdvisorSelect
            advisors={advisorsByCapacity}
            value={bulkAdvisorId}
            onValueChange={setBulkAdvisorId}
            showWorkload
            placeholder="Choose advisor"
            className="w-56"
          />
          <input type="hidden" name="advisorId" value={bulkAdvisorId} />
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button type="submit" disabled={!bulkAdvisorId || pending}>
              {pending
                ? "Assigning…"
                : bulkAdvisor
                  ? `Assign to ${bulkAdvisor.name}`
                  : "Assign"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
