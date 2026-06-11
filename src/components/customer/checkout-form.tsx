"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Phone, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderTypeSelector, type OrderTypeOption } from "@/components/customer/order-type-selector";
import {
  PickupLocationSelector,
  type PickupLocationOption,
} from "@/components/customer/pickup-location-selector";
import { RestaurantStatusBanner } from "@/components/customer/restaurant-status-banner";
import { PreorderSlotSelector } from "@/components/customer/preorder-slot-selector";
import { MinOrderProgress } from "@/components/customer/min-order-progress";
import { CartTotals } from "@/components/customer/cart-totals";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/stores/cart";
import { createOrder } from "@/actions/orders";
import type { RestaurantHoursInfo } from "@/lib/restaurant-hours";

interface CheckoutFormProps {
  pickupLocations: PickupLocationOption[];
  pickupTime: number;
  deliveryTime: number;
  hours: RestaurantHoursInfo;
  minOrder: number;
}

export function CheckoutForm({
  pickupLocations,
  pickupTime,
  deliveryTime,
  hours,
  minOrder,
}: CheckoutFormProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);
  const clearCart = useCartStore((s) => s.clearCart);
  const [orderType, setOrderType] = useState<OrderTypeOption>("DELIVERY");
  const [pickupLocationId, setPickupLocationId] = useState(pickupLocations[0]?.id ?? "");
  const [scheduledFor, setScheduledFor] = useState(hours.preorderSlots[0]?.iso ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isPickup = orderType === "PICKUP";
  const eta = isPickup ? pickupTime : deliveryTime;
  const minReached = subtotal >= minOrder;
  const isPreorder = !hours.acceptingOrders && hours.canOrder;
  const canSubmit =
    hours.canOrder &&
    minReached &&
    (!isPreorder || Boolean(scheduledFor));

  if (!hydrated) {
    return <div className="mx-auto max-w-2xl px-4 py-8" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-medium">Корзина пуста</p>
        <Button asChild className="mt-4">
          <Link href="/">К меню</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createOrder(items, {
      guestName: formData.get("guestName") as string,
      guestPhone: formData.get("guestPhone") as string,
      orderType: formData.get("orderType") as OrderTypeOption,
      pickupLocationId: (formData.get("pickupLocationId") as string) || undefined,
      deliveryStreet: (formData.get("deliveryStreet") as string) || undefined,
      deliveryApartment: (formData.get("deliveryApartment") as string) || undefined,
      deliveryComment: (formData.get("deliveryComment") as string) || undefined,
      comment: (formData.get("comment") as string) || undefined,
      promoCode: appliedPromo?.code,
      scheduledFor: isPreorder ? scheduledFor : undefined,
    });

    setLoading(false);

    if (result.error) {
      if ("staleCart" in result && result.staleCart) {
        clearCart();
      }
      if ("stalePromo" in result && result.stalePromo) {
        clearPromo();
      }
      setError(result.error);
      return;
    }

    clearCart();
    router.push(`/orders/${result.orderId}`);
  }

  const submitLabel = loading
    ? "Оформляем..."
    : !hours.canOrder
      ? "Заказ недоступен"
      : !minReached
        ? "Минимальный заказ не набран"
        : isPreorder
          ? "Подтвердить предзаказ"
          : "Подтвердить заказ";

  return (
    <>
      <RestaurantStatusBanner hours={hours} className="mx-3 md:mx-auto md:max-w-2xl" />

      <div className="mx-auto max-w-2xl px-3 pb-32 pt-4 md:px-4 md:py-8 md:pb-8">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary md:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад в корзину
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            {isPreorder ? "Предзаказ" : "Оформление"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isPreorder
              ? "Выберите время, когда ресторан откроется — мы подготовим заказ к этому моменту."
              : "Регистрация не нужна — после заказа сохраните ссылку для отслеживания."}
          </p>
        </motion.div>

        <form id="checkout-form" onSubmit={handleSubmit} className="mt-6 space-y-4 md:mt-8 md:space-y-6">
          <MinOrderProgress subtotal={subtotal} minOrder={minOrder} />

          {isPreorder && (
            <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary-light/40 p-4 shadow-[var(--shadow-card)] md:rounded-3xl md:p-6">
              <h2 className="font-display text-lg font-bold">Время предзаказа</h2>
              <PreorderSlotSelector
                slots={hours.preorderSlots}
                value={scheduledFor}
                onChange={setScheduledFor}
              />
            </div>
          )}

          <div className="space-y-4 rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)] md:rounded-3xl md:p-6">
            <h2 className="font-display text-lg font-bold">Способ получения</h2>
            <OrderTypeSelector value={orderType} onChange={setOrderType} />
            <p className="flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4 text-primary" />
              {isPreorder
                ? "Подготовим к выбранному времени"
                : `${isPickup ? "Готовность" : "Доставка"} ~${eta} мин`}
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)] md:rounded-3xl md:p-6">
            <h2 className="font-display text-lg font-bold">Контакты</h2>
            <div className="space-y-2">
              <Label htmlFor="guestName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Имя
              </Label>
              <Input id="guestName" name="guestName" placeholder="Как к вам обращаться" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Телефон
              </Label>
              <Input
                id="guestPhone"
                name="guestPhone"
                type="tel"
                placeholder="+7 900 000-00-00"
                required
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          </div>

          {isPickup ? (
            <div className="space-y-4 rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)] md:rounded-3xl md:p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <Store className="h-5 w-5 text-primary" />
                Точка самовывоза
              </h2>
              {pickupLocations.length > 0 ? (
                <PickupLocationSelector
                  locations={pickupLocations}
                  value={pickupLocationId}
                  onChange={setPickupLocationId}
                />
              ) : (
                <p className="text-sm text-muted">Точки самовывоза временно недоступны</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="comment">Комментарий к заказу</Label>
                <Input id="comment" name="comment" placeholder="Время приезда, пожелания..." autoComplete="off" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)] md:rounded-3xl md:p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Адрес доставки
              </h2>
              <div className="space-y-2">
                <Label htmlFor="deliveryStreet">Адрес</Label>
                <Input id="deliveryStreet" name="deliveryStreet" placeholder="ул. Пушкина, д. 10" required autoComplete="street-address" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deliveryApartment">Квартира</Label>
                  <Input id="deliveryApartment" name="deliveryApartment" placeholder="кв. 5" autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryComment">Домофон</Label>
                  <Input id="deliveryComment" name="deliveryComment" placeholder="код, подъезд" autoComplete="off" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Комментарий к заказу</Label>
                <Input id="comment" name="comment" placeholder="Без лука, острое..." autoComplete="off" />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-[var(--shadow-card)] md:rounded-3xl md:p-6">
            <p className="text-sm text-muted">Способ оплаты</p>
            <p className="mt-1 font-semibold text-foreground">При получении</p>
            <div className="mt-4 border-t border-border/80 pt-4 md:mt-5 md:pt-5">
              <CartTotals />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="hidden w-full md:flex" size="lg" disabled={loading || !canSubmit}>
            {submitLabel}
          </Button>
        </form>
      </div>

      <div
        className="fixed left-0 right-0 z-40 border-t border-border/80 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden"
        style={{ bottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CartTotals size="sm" />
          </div>
          <Button
            type="submit"
            form="checkout-form"
            size="lg"
            className="min-w-[160px] shrink-0"
            disabled={loading || !canSubmit}
          >
            {loading ? "..." : !canSubmit ? "—" : isPreorder ? "Предзаказ" : "Заказать"}
          </Button>
        </div>
      </div>
    </>
  );
}
