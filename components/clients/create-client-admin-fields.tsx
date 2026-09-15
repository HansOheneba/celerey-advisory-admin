"use client";

import { useState } from "react";
import { AdvisorSelect, UNASSIGNED_ADVISOR_VALUE } from "@/components/advisors/advisor-select";
import { CoreDurationFields } from "@/components/clients/core-duration-fields";
import { Label } from "@/components/ui/label";
import { DEFAULT_CORE_DURATION_DAYS } from "@/lib/definitions";
import type { Advisor } from "@/types/advisor";

type CreateClientAdminFieldsProps = {
  canManageSubscriptions: boolean;
  advisors: Advisor[];
  durationError?: string;
};

export function CreateClientAdminFields({
  canManageSubscriptions,
  advisors,
  durationError,
}: CreateClientAdminFieldsProps) {
  const [grantCore, setGrantCore] = useState(canManageSubscriptions);
  const [advisorId, setAdvisorId] = useState(UNASSIGNED_ADVISOR_VALUE);

  if (!canManageSubscriptions) {
    return (
      <input type="hidden" name="duration" value={DEFAULT_CORE_DURATION_DAYS} />
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="advisorId">Assign advisor</Label>
        <input
          type="hidden"
          name="advisorId"
          value={advisorId === UNASSIGNED_ADVISOR_VALUE ? "" : advisorId}
        />
        <AdvisorSelect
          id="advisorId"
          advisors={advisors}
          value={advisorId}
          onValueChange={(next) => setAdvisorId(next || UNASSIGNED_ADVISOR_VALUE)}
          includeUnassigned
          showWorkload
          placeholder="Unassigned"
        />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="grantCore"
            value="true"
            checked={grantCore}
            onChange={(event) => setGrantCore(event.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            <span className="font-medium">Grant Fidelity Core</span>
            <span className="mt-0.5 block text-muted-foreground">
              Give Core access immediately (recovery / paid-offline cases).
            </span>
          </span>
        </label>

        {grantCore ? (
          <div className="pl-7">
            <CoreDurationFields error={durationError} />
          </div>
        ) : null}
      </div>
    </>
  );
}
