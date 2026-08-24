"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  advisorInitials,
  advisorLabelForId,
  advisorOptionLabel,
  advisorWorkloadLabel,
} from "@/lib/advisors/assignable";
import { cn } from "@/lib/utils";
import type { Advisor } from "@/types/advisor";

export const UNASSIGNED_ADVISOR_VALUE = "unassigned";

type AdvisorSelectProps = {
  advisors: Advisor[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeUnassigned?: boolean;
  showWorkload?: boolean;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "default";
  className?: string;
};

function AdvisorOption({
  advisor,
  showWorkload,
}: {
  advisor: Advisor;
  showWorkload: boolean;
}) {
  return (
    <>
      <Avatar size="sm">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {advisorInitials(advisor.name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 text-left">
        <span className="block truncate">{advisorOptionLabel(advisor)}</span>
        {showWorkload ? (
          <span className="block text-xs text-muted-foreground tabular-nums">
            {advisorWorkloadLabel(advisor.clientCount)}
          </span>
        ) : null}
      </span>
    </>
  );
}

export function AdvisorSelect({
  advisors,
  value,
  onValueChange,
  placeholder = "Choose advisor",
  includeUnassigned = false,
  showWorkload = false,
  disabled = false,
  id,
  size = "default",
  className,
}: AdvisorSelectProps) {
  const emptyLabel = includeUnassigned ? "Unassigned" : placeholder;

  return (
    <Select
      value={value || null}
      onValueChange={(next) => onValueChange(next ?? "")}
      disabled={disabled}
    >
      <SelectTrigger id={id} size={size} className={cn("w-full", className)}>
        <SelectValue placeholder={emptyLabel}>
          {(selectedValue: string | null) => {
            const resolved = selectedValue ?? value;
            if (!resolved || resolved === UNASSIGNED_ADVISOR_VALUE) {
              if (includeUnassigned && resolved === UNASSIGNED_ADVISOR_VALUE) {
                return "Unassigned";
              }

              return (
                <span className="text-muted-foreground">{emptyLabel}</span>
              );
            }

            const advisor = advisors.find((item) => item.id === resolved);
            if (!advisor) {
              return advisorLabelForId(advisors, resolved, emptyLabel);
            }

            return (
              <span className="flex min-w-0 items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {advisorInitials(advisor.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{advisorOptionLabel(advisor)}</span>
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="min-w-[16rem]"
      >
        {includeUnassigned ? (
          <SelectItem value={UNASSIGNED_ADVISOR_VALUE}>Unassigned</SelectItem>
        ) : null}
        {advisors.map((advisor) => (
          <SelectItem key={advisor.id} value={advisor.id}>
            <AdvisorOption advisor={advisor} showWorkload={showWorkload} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
