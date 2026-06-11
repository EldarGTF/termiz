"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromoCodeForm } from "@/components/customer/promo-code-form";
import { CartTotals } from "@/components/customer/cart-totals";
import { MinOrderProgress } from "@/components/customer/min-order-progress";
import { RestaurantStatusBanner } from "@/components/customer/restaurant-status-banner";
import type { RestaurantHoursInfo } from "@/lib/restaurant-hours";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/stores/cart";
import { syncCartItems } from "@/actions/cart";
import { formatPrice } from "@/lib/utils";
import { getFoodGradient } from "@/lib/food-placeholder";
import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";

interface CartPageClientProps {
  hours: RestaurantHoursInfo;
  minOrder: number;
}

export function CartPageClient({ hours, minOrder }: CartPageClientProps) {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const setItems = useCartStore((s) => s.setItems);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const minReached = subtotal >= minOrder;
  const isPreorder = !hours.acceptingOrders && hours.canOrder;
  const canCheckout = hours.canOrder && minReached && items.length > 0;

  useEffect(() => {
    if (!hydrated || items.length === 0) return;

    void syncCartItems(items).then((result) => {
      if ("error" in result && result.error) return;
      if (!result.items) return;

      if (result.removed.length > 0) {
        setSyncMessage(`Убрано из корзины: ${result.removed.join(", ")}`);
      } else if (result.priceChanged) {
        setSyncMessage("Цены обновлены по актуальному меню");
      }

      const changed =
        result.items.length !== items.length ||
        result.items.some(
          (item, i) =>
            item.price !== items[i]?.price ||
            item.menuItemId !== items[i]?.menuItemId,
        );

      if (changed) {
        setItems(result.items);
      }
    });
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-3 py-4">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-light">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Корзина пуста</h1>
        <p className="mt-2 text-muted">Добавьте что-нибудь вкусное из меню</p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/">К меню</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <RestaurantStatusBanner hours={hours} className="mx-3 md:mx-auto md:max-w-2xl" />

      <div className="mx-auto max-w-2xl px-3 pb-36 pt-4 md:px-4 md:py-8 md:pb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Корзина</h1>
        <p className="mt-1 text-sm text-muted">{items.length} позиций</p>

        {syncMessage && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-primary-light px-3 py-2 text-sm text-muted">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {syncMessage}
          </p>
        )}

        <div className="mt-5 space-y-3 md:mt-8 md:space-y-4">
          {items.map((item, i) => {
            const gradient = getFoodGradient(item.name);
            return (
              <motion.div
                key={item.menuItemId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)] md:rounded-3xl md:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br", gradient)}>
                        <UtensilsCrossed className="h-6 w-6 text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-snug">{item.name}</h3>
                        <p className="mt-1 text-base font-bold text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-500 active:bg-red-50"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-muted p-1">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-white active:scale-95"
                        aria-label="Уменьшить"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="text-lg font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white active:scale-95"
                        aria-label="Увеличить"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 space-y-4 md:mt-6">
          <MinOrderProgress subtotal={subtotal} minOrder={minOrder} />
          <PromoCodeForm />
        </div>

        <div className="mt-5 hidden rounded-3xl border border-border/80 bg-white p-6 shadow-[var(--shadow-card)] md:block">
          <CartTotals />
          <p className="mt-3 text-sm text-muted">Оплата при получении</p>
          {canCheckout ? (
            <Button asChild className="mt-5 w-full" size="lg">
              <Link href="/checkout">{isPreorder ? "Оформить предзаказ" : "Оформить заказ"}</Link>
            </Button>
          ) : (
            <Button className="mt-5 w-full" size="lg" disabled>
              {!hours.canOrder ? "Заказ недоступен" : isPreorder ? "Минимальная сумма" : "Добавьте ещё блюд"}
            </Button>
          )}
        </div>
      </div>

      <div
        className="fixed left-0 right-0 z-40 border-t border-border/80 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden"
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CartTotals size="sm" />
          </div>
          {canCheckout ? (
            <Button asChild size="lg" className="min-w-[140px] shrink-0">
              <Link href="/checkout">{isPreorder ? "Предзаказ" : "Оформить"}</Link>
            </Button>
          ) : (
            <Button size="lg" className="min-w-[140px] shrink-0" disabled>
              {!hours.canOrder ? "Недоступно" : "Ещё блюд"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
