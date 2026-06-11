"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderPushSubscribe({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "unsupported">("idle");

  async function subscribe() {
    setStatus("loading");

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("error");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setStatus("error");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      const res = await fetch("/api/push/order-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "unsupported") return null;

  return (
    <div className="mt-4 rounded-2xl border border-border/80 bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Уведомления о статусе</p>
          <p className="mt-1 text-xs text-muted">
            Получайте push, когда заказ подтвердят или будет готов.
          </p>
          <Button
            size="sm"
            className="mt-3"
            onClick={subscribe}
            disabled={status === "loading" || status === "done"}
          >
            {status === "done"
              ? "Уведомления включены"
              : status === "loading"
                ? "Подключаем..."
                : "Включить"}
          </Button>
          {status === "error" && (
            <p className="mt-2 text-xs text-red-600">Не удалось включить уведомления</p>
          )}
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
