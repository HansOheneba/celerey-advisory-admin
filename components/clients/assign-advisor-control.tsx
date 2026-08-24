"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { assignClientAdvisorAction } from "@/app/actions/clients";
import {
  AdvisorSelect,
  UNASSIGNED_ADVISOR_VALUE,
} from "@/components/advisors/advisor-select";
import { Label } from "@/components/ui/label";
import type { Advisor } from "@/types/advisor";

type AssignAdvisorControlProps = {
  clientId: string;
  advisorId: string;
  advisors: Advisor[];
  compact?: boolean;
  allowUnassigned?: boolean;
};

export function AssignAdvisorControl({
  clientId,
  advisorId,
  advisors,
  compact = false,
  allowUnassigned = true,
}: AssignAdvisorControlProps) {
  const initialValue = advisorId || UNASSIGNED_ADVISOR_VALUE;
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setValue(advisorId || UNASSIGNED_ADVISOR_VALUE);
  }, [advisorId]);

  function commit(next: string) {
    if (!next || next === value) {
      return;
    }

    const previous = value;
    setValue(next);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("clientId", clientId);
      formData.set("advisorId", next);
      const result = await assignClientAdvisorAction(undefined, formData);

      if (result?.success) {
        const advisor = advisors.find((item) => item.id === next);
        toast.success(
          next === UNASSIGNED_ADVISOR_VALUE || !advisor
            ? "Client unassigned"
            : `Assigned to ${advisor.name}`,
        );
        return;
      }

      setValue(previous);
      toast.error(result?.message ?? "Could not update assignment");
    });
  }

  const select = (
    <AdvisorSelect
      id={`advisor-${clientId}`}
      advisors={advisors}
      value={allowUnassigned ? value : value === UNASSIGNED_ADVISOR_VALUE ? "" : value}
      onValueChange={commit}
      includeUnassigned={allowUnassigned}
      showWorkload
      disabled={pending}
      size={compact ? "sm" : "default"}
      placeholder={allowUnassigned ? "Unassigned" : "Assign to…"}
    />
  );

  if (compact) {
    return select;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`advisor-${clientId}`}>Advisor</Label>
      {select}
    </div>
  );
}
