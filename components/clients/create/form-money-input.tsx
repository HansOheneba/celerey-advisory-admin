"use client";

import { useState } from "react";
import {
  formatNumberWithCommas,
  parseMoneyInput,
} from "@/lib/clients/property-form";
import { cn } from "@/lib/utils";

type FormMoneyInputProps = {
  id: string;
  name: string;
  currency: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onNumericChange?: (value: number) => void;
  className?: string;
};

export function FormMoneyInput({
  id,
  name,
  currency,
  defaultValue = "",
  placeholder,
  required,
  disabled,
  onNumericChange,
  className,
}: FormMoneyInputProps) {
  const initial =
    typeof defaultValue === "number"
      ? formatNumberWithCommas(String(defaultValue))
      : defaultValue
        ? formatNumberWithCommas(defaultValue)
        : "";

  const [display, setDisplay] = useState(initial);
  const numeric = parseMoneyInput(display);

  function handleChange(value: string) {
    const formatted = formatNumberWithCommas(value);
    setDisplay(formatted);
    onNumericChange?.(parseMoneyInput(formatted));
  }

  return (
    <div className={className}>
      <input
        type="hidden"
        name={name}
        value={disabled ? "" : numeric > 0 ? String(numeric) : ""}
      />
      <div
        className={cn(
          "flex h-8 w-full overflow-hidden rounded-lg border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          disabled && "opacity-50",
        )}
      >
        <span className="flex shrink-0 select-none items-center border-r border-input bg-muted/50 px-2.5 text-xs font-medium text-muted-foreground">
          {currency}
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={display}
          disabled={disabled}
          required={required && !disabled}
          onChange={(event) => handleChange(event.target.value)}
          className="flex-1 bg-transparent px-3 py-1 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        />
      </div>
    </div>
  );
}
