import { Label } from "@/components/ui/label";
import { headingTitle } from "@/lib/format";

export function ProfileField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ?? "space-y-2"}>
      <Label htmlFor={htmlFor}>{headingTitle(label)}</Label>
      {children}
    </div>
  );
}
