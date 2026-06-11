"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getOrderStatusSteps,
  getPickupStatusLabel,
  ORDER_STATUS_LABELS,
} from "@/lib/constants";
import type { OrderStatus, OrderType } from "@prisma/client";

interface OrderTrackingProps {
  orderId: string;
  initialStatus: OrderStatus;
  orderType: OrderType;
  etaMinutes?: number | null;
}

export function OrderTracking({
  orderId,
  initialStatus,
  orderType,
  etaMinutes,
}: OrderTrackingProps) {
  const [status, setStatus] = useState(initialStatus);
  const steps = getOrderStatusSteps(orderType);

  useEffect(() => {
    const source = new EventSource(`/api/orders/${orderId}/stream`);
    source.onmessage = (event) => {
      const data = JSON.parse(event.data) as { status: OrderStatus };
      setStatus(data.status);
    };
    return () => source.close();
  }, [orderId]);

  const currentIndex = Math.max(0, steps.indexOf(status));

  function stepLabel(step: OrderStatus) {
    return orderType === "PICKUP" ? getPickupStatusLabel(step) : ORDER_STATUS_LABELS[step];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge>
          {orderType === "PICKUP" ? getPickupStatusLabel(status) : ORDER_STATUS_LABELS[status]}
        </Badge>
        {etaMinutes && status !== "DELIVERED" && status !== "CANCELLED" && (
          <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
            ~{etaMinutes} мин
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
        <div
          className="absolute left-5 top-5 w-0.5 bg-primary transition-all duration-500"
          style={{
            height: `${(currentIndex / (steps.length - 1)) * 100}%`,
            maxHeight: "calc(100% - 2.5rem)",
          }}
        />

        <div className="relative space-y-5">
          {steps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = step === status;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-4"
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-surface-muted text-muted border border-border"
                  } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                >
                  {isActive && index < currentIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    isActive ? "font-semibold text-foreground" : "text-muted"
                  }`}
                >
                  {stepLabel(step)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
