import Image from "next/image";

import { cn } from "@/lib/utils";

const CELEREY_AI_GIF = "/logos/Celerey-glow.gif";
const CELEREY_AI_STATIC = "/logos/Celerey-Secondary-Symbol-Dark.png";

const SIZE_PX = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  hero: 72,
} as const;

type CelereyAiSymbolProps = {
  size?: keyof typeof SIZE_PX;
  /** Sidebar and compact chrome use the static C mark; pages use the animated glow. */
  variant?: "animated" | "static";
  className?: string;
};

export function CelereyAiSymbol({
  size = "md",
  variant = "animated",
  className,
}: CelereyAiSymbolProps) {
  const px = SIZE_PX[size];

  if (variant === "static") {
    return (
      <Image
        src={CELEREY_AI_STATIC}
        alt=""
        width={px}
        height={px}
        className={cn("shrink-0 object-contain", className)}
        aria-hidden
      />
    );
  }

  return (
    // Native img so Next.js image optimization does not flatten the GIF.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CELEREY_AI_GIF}
      alt=""
      width={px}
      height={px}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden
      decoding="async"
    />
  );
}
