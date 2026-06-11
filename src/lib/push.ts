import webpush from "web-push";
import { prisma } from "./prisma";

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@termiz.ru";

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

async function sendToSubscriptions(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url?: string },
) {
  if (!configureWebPush() || subscriptions.length === 0) return;

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      ),
    ),
  );
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  await sendToSubscriptions(subscriptions, payload);
}

export async function sendPushToOrder(
  orderId: string,
  payload: { title: string; body: string; url?: string },
) {
  const subscriptions = await prisma.orderPushSubscription.findMany({
    where: { orderId },
  });

  await sendToSubscriptions(subscriptions, payload);
}
