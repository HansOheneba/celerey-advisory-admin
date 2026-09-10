import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const statusPillVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
  {
    variants: {
      tone: {
        neutral:
          "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
        success:
          "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
        warning:
          "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100",
        danger:
          "border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100",
        info: "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100",
        brand:
          "border-violet-300 bg-violet-100 text-violet-950 dark:border-violet-600 dark:bg-violet-950 dark:text-violet-100",
        orange:
          "border-orange-300 bg-orange-100 text-orange-900 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-100",
        blue: "border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type StatusPillTone = NonNullable<
  VariantProps<typeof statusPillVariants>["tone"]
>;

type StatusPillProps = {
  label: string;
  tone?: StatusPillTone;
  className?: string;
};

export function StatusPill({ label, tone = "neutral", className }: StatusPillProps) {
  return (
    <span className={cn(statusPillVariants({ tone }), className)}>{label}</span>
  );
}
