import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { headingTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

type CreatePageShellProps = {
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function CreatePageShell({
  backHref = "/clients/new",
  backLabel = "Add client",
  eyebrow = "Client book",
  title,
  description,
  children,
}: CreatePageShellProps) {
  return (
    <div className={dashboardTheme.pageContainer}>
      <Link
        href={backHref}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ArrowLeft />
        {backLabel}
      </Link>

      <section className="space-y-1">
        <p className={dashboardTheme.sectionLabel}>{headingTitle(eyebrow)}</p>
        <h1 className={dashboardTheme.pageTitle}>{headingTitle(title)}</h1>
        <p className={dashboardTheme.pageDescription}>{description}</p>
      </section>

      {children}
    </div>
  );
}
