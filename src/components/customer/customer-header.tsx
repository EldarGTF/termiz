"use client";

import Link from "next/link";
import { UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";

export function CustomerHeader() {
  const hydrated = useHydrated();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header
      className="sticky top-0 z-50 glass border-b border-border/60"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:h-16">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30 md:h-9 md:w-9">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-foreground md:text-xl">
            Termiz
          </span>
        </Link>

        <Link
          href="/cart"
          prefetch={false}
          className={cn(
            "relative hidden items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-colors md:flex",
            "bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary-hover",
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          Корзина
          {hydrated && totalItems > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-primary">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
