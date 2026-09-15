"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { headingTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

type ClientSelectOption = {
  id: string;
  name: string;
};

type ClientSelectProps = {
  clients: ClientSelectOption[];
  value: string;
  onValueChange: (clientId: string) => void;
  className?: string;
  id?: string;
};

export function ClientSelect({
  clients,
  value,
  onValueChange,
  className,
  id = "tools-client-select",
}: ClientSelectProps) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {headingTitle("Client")}
      </Label>
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next ?? value)}
      >
        <SelectTrigger id={id} className="w-full" aria-label="Client">
          <SelectValue placeholder="Select client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
