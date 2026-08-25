"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Eye,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import type { Client } from "@/types/client";
import { SubscriptionBadge } from "@/components/clients/subscription-badge";
import { RiskBadge, StatusBadge } from "@/components/clients/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  formatCurrency,
  formatDate,
  getInitials,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type ClientsTableProps = {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  query: string;
  status: string;
  riskLevel: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  canManageSubscriptions?: boolean;
  showAdvisorColumn?: boolean;
};

export function ClientsTable({
  items,
  total,
  page,
  pageSize,
  pageCount,
  query,
  status,
  riskLevel,
  sortBy,
  sortDir,
  canManageSubscriptions = false,
  showAdvisorColumn = false,
}: ClientsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      const shouldDelete =
        !value || value === "all" || (key === "page" && value === "1");

      if (shouldDelete) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    startTransition(() => {
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams({ query: value || null, page: "1" });
  }, 300);

  function toggleSort(column: string) {
    if (sortBy === column) {
      updateParams({
        sortBy: column,
        sortDir: sortDir === "asc" ? "desc" : "asc",
        page: "1",
      });
      return;
    }

    updateParams({
      sortBy: column,
      sortDir: column === "joinedAt" ? "desc" : "asc",
      page: "1",
    });
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
              debouncedSearch(event.target.value);
            }}
            placeholder="Search by name, email, or location"
            className="pl-8"
            aria-label="Search clients"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={status}
            onValueChange={(value) =>
              updateParams({ status: value ?? "all", page: "1" })
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={riskLevel}
            onValueChange={(value) =>
              updateParams({ riskLevel: value ?? "all", page: "1" })
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={cn(
          dashboardTheme.tableShell,
          isPending && "opacity-70 transition-opacity",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-medium"
                  onClick={() => toggleSort("name")}
                >
                  Client
                  <ArrowDownUp className="size-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-medium"
                  onClick={() => toggleSort("joinedAt")}
                >
                  Joined
                  <ArrowDownUp className="size-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              {canManageSubscriptions ? (
                <TableHead className="hidden lg:table-cell">
                  Subscription
                </TableHead>
              ) : null}
              {showAdvisorColumn ? (
                <TableHead className="hidden lg:table-cell">Advisor</TableHead>
              ) : null}
              <TableHead className="hidden xl:table-cell">Risk</TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-medium"
                  onClick={() => toggleSort("aua")}
                >
                  AUA
                  <ArrowDownUp className="size-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead className="hidden xl:table-cell">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-medium"
                  onClick={() => toggleSort("lastContactAt")}
                >
                  Last contact
                  <ArrowDownUp className="size-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead className="hidden xl:table-cell">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-medium"
                  onClick={() => toggleSort("nextReviewAt")}
                >
                  Next review
                  <ArrowDownUp className="size-3.5 text-muted-foreground" />
                </button>
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    7 +
                    (canManageSubscriptions ? 1 : 0) +
                    (showAdvisorColumn ? 1 : 0) +
                    1
                  }
                  className="p-0"
                >
                  <div
                    className={cn(
                      dashboardTheme.emptyState,
                      "m-4 flex flex-col items-center justify-center px-6 py-16 text-center",
                    )}
                  >
                    <p className="text-sm font-medium">No clients found</p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Try a different search term or clear the status and risk
                      filters to broaden results.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((client) => (
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
                        <div className="mt-1 flex gap-1 md:hidden">
                          <StatusBadge status={client.status} />
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(client.joinedAt)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusBadge status={client.status} />
                  </TableCell>
                  {canManageSubscriptions ? (
                    <TableCell className="hidden lg:table-cell">
                      <SubscriptionBadge subscription={client.subscription} />
                    </TableCell>
                  ) : null}
                  {showAdvisorColumn ? (
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {client.advisorName || "Unassigned"}
                    </TableCell>
                  ) : null}
                  <TableCell className="hidden xl:table-cell">
                    <RiskBadge riskLevel={client.riskLevel} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(client.aua, client.currency)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {formatDate(client.lastContactAt)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {formatDate(client.nextReviewAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${client.firstName} ${client.lastName}`}
                          />
                        }
                      >
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`/clients/${client.id}`} />}
                        >
                          <Eye />
                          View full profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={<a href={`mailto:${client.email}`} />}
                        >
                          <Mail />
                          Email client
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={<a href={`tel:${client.phone}`} />}
                        >
                          <Phone />
                          Call client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {from}-{to} of {total} clients
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            <ChevronLeft />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount || isPending}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
