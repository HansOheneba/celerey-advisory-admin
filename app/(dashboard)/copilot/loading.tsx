import { CelereyAiSymbol } from "@/components/brand/celerey-ai-symbol";

export default function CopilotLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <CelereyAiSymbol size="hero" className="size-[4.5rem] opacity-60" />
    </div>
  );
}
