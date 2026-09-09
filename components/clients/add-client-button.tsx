import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddClientButton() {
  return (
    <Button className="shrink-0" render={<Link href="/clients/new" />}>
      <Plus data-icon="inline-start" />
      Add client
    </Button>
  );
}
