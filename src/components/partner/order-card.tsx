"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/actions/orders";
import {
  getPartnerNextStatus,
  getPartnerStatusAction,
  ORDER_TYPE_LABELS,
  ORDER_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order, OrderItem, PickupLocation, User } from "@prisma/client";

interface OrderCardProps {
  order: Order & { items: OrderItem[]; user: User | null; pickupLocation: PickupLocation | null };
}

export function OrderCard({ order }: OrderCardProps) {
  const [isPending, startTransition] = useTransition();
  const nextStatus = getPartnerNextStatus(order.status, order.orderType);
  const actionLabel = nextStatus ? getPartnerStatusAction(order.status, order.orderType) : null;

  function advanceStatus() {
    if (!nextStatus) return;
    const formData = new FormData();
    formData.set("orderId", order.id);
    formData.set("status", nextStatus);
    startTransition(() => {
      void updateOrderStatus(formData);
    });
  }

  function cancelOrder() {
    const formData = new FormData();
    formData.set("orderId", order.id);
    formData.set("status", "CANCELLED");
    startTransition(() => {
      void updateOrderStatus(formData);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Заказ #{order.orderNumber}</h3>
          <p className="text-sm text-muted">
            {order.user?.name ?? order.guestName ?? "Гость"}
            {order.guestPhone && ` · ${order.guestPhone}`}
          </p>
          <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {order.isPreorder && <Badge variant="warning">Предзаказ</Badge>}
          <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-primary">
        {ORDER_TYPE_LABELS[order.orderType]}
      </p>
      {order.isPreorder && order.scheduledFor && (
        <p className="mt-1 text-xs text-muted">
          К времени: {formatDate(order.scheduledFor)}
        </p>
      )}

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-muted">
        {order.orderType === "PICKUP" ? (
          <>
            Самовывоз
            {order.pickupLocation ? `: ${order.pickupLocation.name}` : ""} — {order.deliveryStreet}
          </>
        ) : (
          order.deliveryStreet
        )}
        {order.deliveryApartment && `, ${order.deliveryApartment}`}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="font-bold text-primary">
            {formatPrice(order.totalAmount)}
          </span>
          {order.discountAmount > 0 && (
            <p className="text-xs text-green-700">
              {order.promoCodeText} −{formatPrice(order.discountAmount)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {order.status === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={cancelOrder}
              disabled={isPending}
            >
              Отменить
            </Button>
          )}
          {actionLabel && nextStatus && (
            <Button size="sm" onClick={advanceStatus} disabled={isPending}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
