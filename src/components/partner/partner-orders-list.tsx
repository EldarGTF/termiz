"use client";

import { useEffect, useState } from "react";
import { OrderCard } from "./order-card";
import type { Order, OrderItem, PickupLocation, User } from "@prisma/client";

interface PartnerOrdersListProps {
  initialOrders: (Order & {
    items: OrderItem[];
    user: User | null;
    pickupLocation: PickupLocation | null;
  })[];
}

export function PartnerOrdersList({ initialOrders }: PartnerOrdersListProps) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/partner/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-white p-8 text-center text-muted">
        Заказов пока нет
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
