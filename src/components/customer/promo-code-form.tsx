"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyPromoCode } from "@/actions/promo";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

export function PromoCodeForm() {
  const subtotal = useCartStore((s) => s.subtotal());
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const setPromo = useCartStore((s) => s.setPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await applyPromoCode(code, subtotal);
    setLoading(false);

    if ("error" in result) {
      setError(result.error ?? "Не удалось применить промокод");
      return;
    }

    setPromo({ code: result.code, discountAmount: result.discountAmount });
    setCode("");
  }

  function handleRemove() {
    clearPromo();
    setError(null);
    setCode("");
  }

  if (appliedPromo) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary-light/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{appliedPromo.code}</p>
              <p className="text-xs text-muted">
                Скидка {formatPrice(appliedPromo.discountAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-white active:scale-95"
            aria-label="Убрать промокод"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)]">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Tag className="h-4 w-4 text-primary" />
        Промокод
      </p>
      <p className="mb-3 text-xs text-muted">
        Промокод сбрасывается при изменении состава корзины
      </p>
      <form onSubmit={handleApply} className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="TERMIZ10"
          className="h-11 flex-1 uppercase"
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" variant="outline" className="h-11 shrink-0 px-5" disabled={loading || !code.trim()}>
          {loading ? "..." : "Применить"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
