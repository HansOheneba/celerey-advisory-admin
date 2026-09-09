"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { removeClientProfileItemAction } from "@/app/actions/client-profile";
import { Button } from "@/components/ui/button";
import type { ProfileCollection } from "@/lib/demo/profile-types";

type RemoveProfileItemButtonProps = {
  clientId: string;
  collection: ProfileCollection;
  itemId: string;
  label: string;
};

export function RemoveProfileItemButton({
  clientId,
  collection,
  itemId,
  label,
}: RemoveProfileItemButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      aria-label={`Remove ${label}`}
      onClick={() => {
        startTransition(async () => {
          const result = await removeClientProfileItemAction(
            clientId,
            collection,
            itemId,
            label,
          );

          if (!result.ok) {
            toast.error(result.message);
            return;
          }

          toast.success(`${label} removed`);
        });
      }}
    >
      <Trash2 />
    </Button>
  );
}
