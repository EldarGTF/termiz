import { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Ожидает подтверждения",
  CONFIRMED: "Подтверждён",
  PREPARING: "Готовится",
  READY: "Готов к выдаче",
  DELIVERING: "В пути",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "DELIVERED",
];

export const PICKUP_STATUS_STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
];

export const ORDER_TYPE_LABELS = {
  DELIVERY: "Доставка",
  PICKUP: "Самовывоз",
} as const;

export const PARTNER_NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "DELIVERING",
  DELIVERING: "DELIVERED",
};

export const PARTNER_STATUS_ACTION: Partial<Record<OrderStatus, string>> = {
  PENDING: "Подтвердить",
  CONFIRMED: "Начать готовить",
  PREPARING: "Готов",
  READY: "Передать курьеру",
  DELIVERING: "Доставлен",
};

export function getOrderStatusSteps(orderType: "DELIVERY" | "PICKUP") {
  return orderType === "PICKUP" ? PICKUP_STATUS_STEPS : ORDER_STATUS_STEPS;
}

export function getPartnerNextStatus(
  status: OrderStatus,
  orderType: "DELIVERY" | "PICKUP",
): OrderStatus | undefined {
  if (orderType === "PICKUP" && status === "READY") {
    return "DELIVERED";
  }
  return PARTNER_NEXT_STATUS[status];
}

export function getPartnerStatusAction(
  status: OrderStatus,
  orderType: "DELIVERY" | "PICKUP",
): string | undefined {
  if (orderType === "PICKUP" && status === "READY") {
    return "Выдан";
  }
  return PARTNER_STATUS_ACTION[status];
}

export function getPickupStatusLabel(status: OrderStatus) {
  if (status === "DELIVERED") return "Выдан";
  if (status === "READY") return "Готов к выдаче";
  return ORDER_STATUS_LABELS[status];
}
