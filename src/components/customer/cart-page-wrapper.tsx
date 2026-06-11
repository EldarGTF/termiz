"use client";

import { useEffect, useState } from "react";
import { CartPageClient } from "@/components/customer/cart-page-client";
import type { RestaurantHoursInfo } from "@/lib/restaurant-hours";
import { getDefaultHoursInfo } from "@/lib/restaurant-hours";

export function CartPageWrapper() {
  const [minOrder, setMinOrder] = useState(1500);
  const [hours, setHours] = useState<RestaurantHoursInfo>(getDefaultHoursInfo());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetch("/api/restaurant/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.minOrder) setMinOrder(data.minOrder);
        if (data?.hours) setHours(data.hours);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-3 py-4">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return <CartPageClient hours={hours} minOrder={minOrder} />;
}
