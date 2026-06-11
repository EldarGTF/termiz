"use client";

import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";

interface CartTotalsProps {
  size?: "sm" | "md";
}

export function CartTotals({ size = "md" }: CartTotalsProps) {
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discountAmount());
  const total = useCartStore((s) => s.totalAmount());
  const appliedPromo = useCartStore((s) => s.appliedPromo);

  const totalClass = size === "sm" ? "text-xl" : "text-xl md:text-2xl";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted">
        <span>Сумма</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {appliedPromo && discount > 0 && (
        <div className="flex justify-between text-sm text-green-700">
          <span>Промокод {appliedPromo.code}</span>
          <span>−{formatPrice(discount)}</span>
        </div>
      )}
      <div className={`flex justify-between font-bold ${totalClass}`}>
        <span>Итого</span>
        <span className="text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
