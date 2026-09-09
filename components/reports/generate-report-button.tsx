"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import { generateClientReport } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REPORT_TEMPLATES } from "@/lib/reports/types";

type GenerateReportButtonProps = {
  clientId: string;
  size?: "sm" | "default";
};

export function GenerateReportButton({
  clientId,
  size = "sm",
}: GenerateReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function generate(templateKey: string, label: string) {
    setOpen(false);

    startTransition(async () => {
      try {
        const result = await generateClientReport(clientId, templateKey);

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        toast.success(`${label} ready`, {
          description: result.report.fileName,
          action: {
            label: "Open",
            onClick: () => {
              window.open(
                `/api/reports/${encodeURIComponent(result.report.id)}/download`,
                "_blank",
              );
            },
          },
        });
      } catch {
        toast.error("The report could not be generated. Please try again.");
      }
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="outline" size={size} disabled={isPending} />}
      >
        <FileText />
        {isPending ? "Generating…" : "Generate report"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Choose a template</DropdownMenuLabel>
          {REPORT_TEMPLATES.map((template) => (
            <DropdownMenuItem
              key={template.key}
              onClick={() => generate(template.key, template.label)}
              className="flex-col items-start gap-0.5"
            >
              <span className="text-sm font-medium">{template.label}</span>
              <span className="text-xs text-muted-foreground">
                {template.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
