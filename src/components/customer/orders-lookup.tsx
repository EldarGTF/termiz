"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { findOrdersByPhone } from "@/actions/orders";
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderStatus, OrderType } from "@prisma/client";

type OrderSummary = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  totalAmount: number;
  orderType: OrderType;
  createdAt: Date;
};

export function OrdersLookup() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await findOrdersByPhone(phone);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      setOrders(null);
      return;
    }

    setOrders(result.orders ?? []);
  }

  return (
    <div className="mx-auto max-w-lg px-3 py-4 md:px-4 md:py-6">
      <h1 className="font-display text-2xl font-bold">Мои заказы</h1>
      <p className="mt-2 text-sm text-muted">
        Введите номер телефона, который указывали при заказе.
      </p>

      <form onSubmit={handleSearch} className="mt-6 space-y-3">
        <Input
          type="tel"
          placeholder="+7 900 000-00-00"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Ищем..." : "Найти заказы"}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {orders && (
        <div className="mt-6 space-y-3">
          {orders.length === 0 ? (
            <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-muted">
              Заказов по этому номеру не найдено
            </p>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Заказ #{order.orderNumber}</span>
                  <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(order.createdAt)} · {ORDER_TYPE_LABELS[order.orderType]}
                </p>
                <p className="mt-2 font-bold text-primary">{formatPrice(order.totalAmount)}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
