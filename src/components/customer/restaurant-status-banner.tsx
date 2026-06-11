import { Clock, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RestaurantHoursInfo } from "@/lib/restaurant-hours";

export function RestaurantStatusBanner({
  hours,
  className,
}: {
  hours: RestaurantHoursInfo;
  className?: string;
}) {
  if (hours.mode === "open") return null;

  const isPreorder = hours.mode === "closed_preorder" && hours.canOrder;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3",
        isPreorder
          ? "border-primary/20 bg-primary-light/70"
          : "border-border/60 bg-muted/40",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isPreorder ? "bg-primary/10" : "bg-muted",
        )}
      >
        {isPreorder ? (
          <CalendarClock className="h-4 w-4 text-primary" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="text-sm leading-snug">
        <p className="font-semibold text-foreground">{hours.statusLabel}</p>
        <p className="text-muted">{hours.statusDetail}</p>
        <p className="mt-1 text-xs text-muted">{hours.scheduleSummary}</p>
      </div>
    </div>
  );
}
