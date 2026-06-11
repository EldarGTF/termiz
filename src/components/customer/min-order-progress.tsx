import { formatPrice } from "@/lib/utils";

interface MinOrderProgressProps {
  subtotal: number;
  minOrder: number;
}

export function MinOrderProgress({ subtotal, minOrder }: MinOrderProgressProps) {
  const remaining = Math.max(0, minOrder - subtotal);
  const progress = Math.min(100, (subtotal / minOrder) * 100);
  const reached = remaining === 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between text-sm">
        <span className={reached ? "font-semibold text-green-700" : "text-muted"}>
          {reached ? "Минимальный заказ набран" : `До минимума ${formatPrice(remaining)}`}
        </span>
        <span className="text-xs text-muted">{formatPrice(subtotal)} / {formatPrice(minOrder)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${reached ? "bg-green-500" : "bg-primary"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
