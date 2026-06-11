"use client";

import { cn } from "@/lib/utils";
import type { PreorderSlot } from "@/lib/restaurant-hours";

interface PreorderSlotSelectorProps {
  slots: PreorderSlot[];
  value: string;
  onChange: (iso: string) => void;
}

export function PreorderSlotSelector({
  slots,
  value,
  onChange,
}: PreorderSlotSelectorProps) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted">
        Нет доступных слотов для предзаказа. Попробуйте позже.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {slots.map((slot) => (
        <button
          key={slot.iso}
          type="button"
          onClick={() => onChange(slot.iso)}
          className={cn(
            "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
            value === slot.iso
              ? "border-primary bg-primary-light font-semibold text-primary"
              : "border-border hover:border-primary/30",
          )}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}
