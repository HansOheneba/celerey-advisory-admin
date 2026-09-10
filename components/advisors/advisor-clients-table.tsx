import Link from "next/link";
import { RiskBadge, StatusBadge } from "@/components/clients/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
import type { Client } from "@/types/client";

type AdvisorClientsTableProps = {
  items: Client[];
};

export function AdvisorClientsTable({ items }: AdvisorClientsTableProps) {
  if (items.length === 0) {
    return (
      <div className={dashboardTheme.emptyState}>
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium">No clients assigned</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign clients to this advisor from the Clients list or a client
            profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardTheme.tableShell}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Risk</TableHead>
            <TableHead>AUA</TableHead>
            <TableHead className="hidden xl:table-cell">Next review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Link
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(client.firstName, client.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium hover:underline">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {client.email}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <StatusBadge status={client.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <RiskBadge riskLevel={client.riskLevel} />
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {formatCurrency(client.aua + client.aum, client.currency)}
              </TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">
                {formatDate(client.nextReviewAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
