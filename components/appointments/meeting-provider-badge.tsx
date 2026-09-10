import { Badge } from "@/components/ui/badge";
import {
  MEETING_PROVIDER_LABELS,
  type MeetingProvider,
} from "@/lib/appointments/types";

type MeetingProviderBadgeProps = {
  provider: MeetingProvider;
};

export function MeetingProviderBadge({ provider }: MeetingProviderBadgeProps) {
  return (
    <Badge variant="secondary" className="text-[10px]">
      {MEETING_PROVIDER_LABELS[provider]}
    </Badge>
  );
}
