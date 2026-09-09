import type { Metadata } from "next";
import Link from "next/link";
import { Mail, UserRoundPen } from "lucide-react";

import { CreatePageShell } from "@/components/clients/create/create-page-shell";
import { IconTile } from "@/components/shared/icon-tile";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { requireClientCreateAccess } from "@/lib/clients/create-page-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Add client",
};

export default async function NewClientPage() {
  await requireClientCreateAccess();

  return (
    <CreatePageShell
      backHref="/clients"
      backLabel="All clients"
      title="Add client"
      description="Choose how you want to bring a new client into the book. Invite flows are lightweight; direct creation lets you seed their full dashboard."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={cn(
            dashboardTheme.card,
            dashboardTheme.tintedSurface.info,
            "shadow-none",
          )}
        >
          <CardHeader>
            <IconTile icon={Mail} variant="info" size="lg" className="mb-2" />
            <CardTitle>Send invite</CardTitle>
            <CardDescription>
              Capture name and email only. The client receives an invite and
              completes the onboarding wizard themselves.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/clients/new/invite"
              className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
            >
              Continue with invite
            </Link>
          </CardContent>
        </Card>

        <Card
          className={cn(
            dashboardTheme.card,
            dashboardTheme.tintedSurface.brand,
            "shadow-none",
          )}
        >
          <CardHeader>
            <IconTile
              icon={UserRoundPen}
              variant="brand"
              size="lg"
              className="mb-2"
            />
            <CardTitle>Create for them</CardTitle>
            <CardDescription>
              Enter identity, cash flow, goals, holdings, and insurance so the
              client opens a fully populated dashboard without entering anything.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/clients/new/direct"
              className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
            >
              Continue with full setup
            </Link>
          </CardContent>
        </Card>
      </div>
    </CreatePageShell>
  );
}
