"use client";

import { useState } from "react";
import { FormSelect } from "@/components/clients/create/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GOAL_CATEGORIES,
  GOAL_STATUS_OPTIONS,
  goalCategoryMeta,
} from "@/lib/clients/creation-options";

type GoalItemFieldsProps = {
  index: number;
  nameFor: (key: string) => string;
  idFor: (key: string) => string;
};

export function GoalItemFields({ index, nameFor, idFor }: GoalItemFieldsProps) {
  const [category, setCategory] = useState("housing");
  const meta = goalCategoryMeta(category);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name={nameFor("icon")} value={meta.icon} />
      <input type="hidden" name={nameFor("color")} value={meta.color} />
      <input type="hidden" name={nameFor("category")} value={category} />

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={idFor("title")}>Title</Label>
        <Input
          id={idFor("title")}
          name={nameFor("title")}
          placeholder="House deposit"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={idFor("category")}>Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value ?? "other")}
        >
          <SelectTrigger id={idFor("category")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GOAL_CATEGORIES.map((entry) => (
              <SelectItem key={entry.value} value={entry.value}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={idFor("status")}>Status</Label>
        <FormSelect
          id={idFor("status")}
          name={nameFor("status")}
          defaultValue="active"
        >
          {GOAL_STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </FormSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor={idFor("target_amount")}>Target amount</Label>
        <Input
          id={idFor("target_amount")}
          name={nameFor("target_amount")}
          type="number"
          min={1}
          step="0.01"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={idFor("current_amount")}>Current amount</Label>
        <Input
          id={idFor("current_amount")}
          name={nameFor("current_amount")}
          type="number"
          min={0}
          step="0.01"
          defaultValue={0}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={idFor("target_date")}>Target date</Label>
        <Input
          id={idFor("target_date")}
          name={nameFor("target_date")}
          type="date"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={idFor("priority")}>Priority</Label>
        <Input
          id={idFor("priority")}
          name={nameFor("priority")}
          type="number"
          min={1}
          defaultValue={index + 1}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={idFor("description")}>Description</Label>
        <Input
          id={idFor("description")}
          name={nameFor("description")}
          placeholder="Optional context for the client dashboard"
        />
      </div>
    </div>
  );
}
