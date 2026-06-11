"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PushSubscribeButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function subscribe() {
    setStatus("loading");

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("error");
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
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <Button
        variant="secondary"
        onClick={subscribe}
        disabled={status === "loading" || status === "done"}
      >
        {status === "done"
          ? "Уведомления включены"
          : status === "loading"
            ? "Подключаем..."
            : "Включить push-уведомления"}
      </Button>
      {status === "error" && (
        <p className="mt-2 text-xs text-muted">
          Push недоступен или не настроен VAPID ключ
        </p>
      )}
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
