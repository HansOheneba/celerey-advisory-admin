import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type CreateFormSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function CreateFormSection({
  id,
  title,
  description,
  children,
  className,
}: CreateFormSectionProps) {
  return (
    <Card
      id={id}
      className={cn(
        dashboardTheme.card,
        dashboardTheme.tintedSurface.brand,
        "scroll-mt-24 shadow-none",
        className,
      )}
    >
      <CardHeader className="border-b border-primary/10">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
