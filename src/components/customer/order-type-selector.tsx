"use client";

import { Truck, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderTypeOption = "DELIVERY" | "PICKUP";

interface OrderTypeSelectorProps {
  value: OrderTypeOption;
  onChange: (value: OrderTypeOption) => void;
}

const options = [
  {
    value: "DELIVERY" as const,
    label: "Доставка",
    description: "Привезём по адресу",
    icon: Truck,
  },
  {
    value: "PICKUP" as const,
    label: "Самовывоз",
    description: "Заберёте сами",
    icon: Store,
  },
];

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(({ value: optionValue, label, description, icon: Icon }) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={cn(
              "rounded-2xl border p-3 text-left transition-all active:scale-[0.98] md:p-4",
              active
                ? "border-primary bg-primary-light shadow-sm"
                : "border-border/80 bg-white hover:border-primary/30",
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted")} />
            <p className={cn("mt-2 text-sm font-bold", active && "text-primary")}>{label}</p>
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          </button>
        );
      })}
      <input type="hidden" name="orderType" value={value} />
    </div>
  );
}
