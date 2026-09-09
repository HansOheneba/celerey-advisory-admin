"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type RepeatableListProps = {
  items: number[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  addLabel: string;
  itemLabel?: string;
  minItems?: number;
  renderItem: (index: number) => React.ReactNode;
};

export function RepeatableList({
  items,
  onAdd,
  onRemove,
  addLabel,
  itemLabel = "Item",
  minItems = 0,
  renderItem,
}: RepeatableListProps) {
  return (
    <div className="space-y-3">
      {items.map((itemKey, index) => (
        <div
          key={itemKey}
          className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {itemLabel} {index + 1}
            </p>
            {items.length > minItems ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
                Remove
              </Button>
            ) : null}
          </div>
          {renderItem(index)}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}
