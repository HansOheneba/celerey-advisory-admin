"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormSelectProps = {
  name: string;
  defaultValue?: string;
  id?: string;
  triggerClassName?: string;
  placeholder?: string;
  children: React.ReactNode;
};

export function FormSelect({
  name,
  defaultValue = "",
  id,
  triggerClassName,
  placeholder,
  children,
}: FormSelectProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={(next) => setValue(next ?? "")}>
        <SelectTrigger id={id} className={triggerClassName ?? "w-full"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </>
  );
}
