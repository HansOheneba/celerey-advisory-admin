"use client";

import Link from "next/link";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { ArrowUpRight } from "lucide-react";
import { AddAdvisorDialog } from "@/components/advisors/add-advisor-dialog";
import { AdvisorRoleSelect } from "@/components/advisors/advisor-role-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { Advisor } from "@/types/advisor";

type UsersRolesTabProps = {
  advisors: Advisor[];
  canManageRoles: boolean;
  currentUserId: string;
};

export function UsersRolesTab({
  advisors,
  canManageRoles,
  currentUserId,
}: UsersRolesTabProps) {
  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <SectionEyebrow>Users &amp; roles</SectionEyebrow>
        <CardTitle className="text-base font-semibold">Team members</CardTitle>
        <p className="text-sm text-muted-foreground">
          {canManageRoles
            ? "Change each person’s roles. Client is required for the client app."
            : "Staff roles are visible here. Only a super admin can change them."}
        </p>
        <CardAction>
          <AddAdvisorDialog />
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        {advisors.length === 0 ? (
          <div className={dashboardTheme.emptyState}>
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium">No advisors yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add an advisor to manage roles.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advisor</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Clients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advisors.map((advisor) => (
                <TableRow key={advisor.id}>
                  <TableCell>
                    <Link
                      href={`/advisors/${advisor.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {advisor.name}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link href="/advisors" />}
        >
          Manage all advisors
          <ArrowUpRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
