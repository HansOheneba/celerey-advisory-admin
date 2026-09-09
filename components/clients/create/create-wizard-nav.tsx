"use client";

import { CREATE_CLIENT_WIZARD_STEPS } from "@/lib/clients/create-steps";
import { cn } from "@/lib/utils";

type CreateWizardNavProps = {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
};

export function CreateWizardNav({
  currentStep,
  onStepClick,
}: CreateWizardNavProps) {
  return (
    <nav aria-label="Create client steps" className="space-y-3">
      <ol className="flex flex-col gap-2">
        {CREATE_CLIENT_WIZARD_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const canNavigate = index < currentStep && onStepClick;

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!canNavigate}
                onClick={() => onStepClick?.(index)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : isComplete
                      ? "border-border/60 bg-muted/30 hover:bg-muted/50"
                      : "border-border/40 bg-background opacity-70",
                  canNavigate ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isComplete
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm",
                      isActive ? "font-medium text-foreground" : "text-foreground/90",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
