"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PickupLocationOption {
  id: string;
  name: string;
  address: string;
}

interface PickupLocationSelectorProps {
  locations: PickupLocationOption[];
  value: string;
  onChange: (id: string) => void;
}

export function PickupLocationSelector({
  locations,
  value,
  onChange,
}: PickupLocationSelectorProps) {
  return (
    <div className="space-y-2">
      {locations.map((location) => {
        const active = value === location.id;
        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onChange(location.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.99] md:p-4",
              active
                ? "border-primary bg-primary-light shadow-sm"
                : "border-border/80 bg-white hover:border-primary/30",
            )}
          >
            <MapPin className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-primary" : "text-muted")} />
            <div>
              <p className={cn("text-sm font-bold", active && "text-primary")}>{location.name}</p>
              <p className="mt-0.5 text-sm text-muted">{location.address}</p>
            </div>
          </button>
        );
      })}
      <input type="hidden" name="pickupLocationId" value={value} />
    </div>
  );
}
