import { Label } from "@/components/ui/label";

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
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
