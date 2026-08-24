import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdvisorRoleSelect } from "@/components/advisors/advisor-role-select";
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
import { getInitials } from "@/lib/format";
import type { Advisor } from "@/types/advisor";

type AdvisorsTableProps = {
  items: Advisor[];
  canManageRoles?: boolean;
  currentUserId?: string;
};

function advisorInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return getInitials(parts[0], "");
  }
  return getInitials(parts[0], parts[parts.length - 1]);
}

export function AdvisorsTable({
  items,
  canManageRoles = false,
  currentUserId,
}: AdvisorsTableProps) {
  if (items.length === 0) {
    return (
      <div className={dashboardTheme.emptyState}>
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium">No advisors yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an advisor to start assigning clients.
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
            <TableHead>Advisor</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Clients</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Open</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((advisor) => (
            <TableRow key={advisor.id} className="group">
              <TableCell>
                <Link
                  href={`/advisors/${advisor.id}`}
                  className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {advisorInitials(advisor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium group-hover:underline">
                      {advisor.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground sm:hidden">
                      {advisor.email || "No email on file"}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {advisor.email || "—"}
              </TableCell>
              <TableCell>
                <AdvisorRoleSelect
                  advisorId={advisor.id}
                  role={advisor.role}
                  roles={advisor.roles}
                  canManageRoles={canManageRoles}
                  isSelf={advisor.id === currentUserId}
                />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {advisor.clientCount}
              </TableCell>
              <TableCell>
                <Link
                  href={`/advisors/${advisor.id}`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Open ${advisor.name}`}
                >
                  <ChevronRight className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
