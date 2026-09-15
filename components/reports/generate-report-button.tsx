"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import {
  generateClientReport,
  sendReportToClient,
} from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DemoReportRecord } from "@/lib/demo/types";
import { REPORT_TEMPLATES } from "@/lib/reports/types";

type GenerateReportButtonProps = {
  clientId: string;
  size?: "sm" | "default";
};

export function GenerateReportButton({
  clientId,
  size = "sm",
}: GenerateReportButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [pendingReport, setPendingReport] = useState<DemoReportRecord | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [isSending, startSendTransition] = useTransition();

  function openDownload(report: DemoReportRecord) {
    window.open(
      `/api/reports/${encodeURIComponent(report.id)}/download`,
      "_blank",
    );
  }

  function finishRelease() {
    setReleaseOpen(false);
    setPendingReport(null);
    router.refresh();
  }

  function generate(templateKey: string, label: string) {
    setOpen(false);

    startTransition(async () => {
      try {
        const result = await generateClientReport(clientId, templateKey);

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        setPendingReport(result.report);
        setReleaseOpen(true);
        toast.success(`${label} ready`);
      } catch {
        toast.error("The report could not be generated. Please try again.");
      }
    });
  }

  function releaseToClient() {
    if (!pendingReport) {
      return;
    }

    const report = pendingReport;

    startSendTransition(async () => {
      const result = await sendReportToClient(report.id);

      if (!result.ok) {
        toast.error(result.message ?? "Could not send the report.");
        return;
      }

      toast.success("Report sent to the client. It appears under Documents.");
      finishRelease();
    });
  }

  return (
    <>
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

      <Dialog
        open={releaseOpen}
        onOpenChange={(next) => {
          if (!next) {
            finishRelease();
          } else {
            setReleaseOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send to client?</DialogTitle>
            <DialogDescription>
              {pendingReport
                ? `${pendingReport.title} is ready. Send it now and it will appear in the client's documents alongside their other files.`
                : "Your report is ready."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSending}
              onClick={() => {
                if (pendingReport) {
                  openDownload(pendingReport);
                }
                finishRelease();
              }}
            >
              Not now
            </Button>
            {pendingReport ? (
              <Button
                type="button"
                variant="outline"
                disabled={isSending}
                onClick={() => openDownload(pendingReport)}
              >
                Open PDF
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={isSending || !pendingReport}
              onClick={releaseToClient}
            >
              {isSending ? "Sending…" : "Send to client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
