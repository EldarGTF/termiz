"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, orderStatusSchema } from "@/lib/validations";
import type { CartItem } from "@/stores/cart";
import { sendPushToUser, sendPushToOrder } from "@/lib/push";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { resolvePromoForOrder } from "@/actions/promo";
import {
  getRestaurantHoursInfo,
  isValidPreorderSlot,
} from "@/lib/restaurant-hours";

async function addStatusHistory(orderId: string, status: OrderStatus) {
  await prisma.orderStatusHistory.create({
    data: { orderId, status },
  });
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function createOrder(
  items: CartItem[],
  data: {
    guestName: string;
    guestPhone: string;
    orderType: "DELIVERY" | "PICKUP";
    pickupLocationId?: string;
    deliveryStreet?: string;
    deliveryApartment?: string;
    deliveryComment?: string;
    comment?: string;
    promoCode?: string;
    scheduledFor?: string;
  },
) {
  if (items.length === 0) {
    return { error: "Корзина пуста" };
  }

  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };
  }

  const guestName = parsed.data.guestName.trim();
  const guestPhone = normalizePhone(parsed.data.guestPhone);

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: "termiz" },
  });

  if (!restaurant) {
    return { error: "Ресторан не найден" };
  }

  const hours = getRestaurantHoursInfo(restaurant);
  const isPreorder = !hours.acceptingOrders;
  const scheduledFor = data.scheduledFor?.trim();

  if (!hours.canOrder) {
    return { error: "Сейчас нельзя оформить заказ. Попробуйте позже." };
  }

  if (isPreorder) {
    if (!scheduledFor) {
      return { error: "Выберите время предзаказа" };
    }
    if (!isValidPreorderSlot(scheduledFor, hours.preorderSlots)) {
      return { error: "Выбранное время предзаказа недоступно" };
    }
  } else if (scheduledFor) {
    return { error: "Предзаказ доступен только вне рабочего времени" };
  }

  const menuItemIds = [...new Set(items.map((i) => i.menuItemId))];
  const dbItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      isAvailable: true,
      category: { restaurantId: restaurant.id },
    },
    select: { id: true, name: true, price: true },
  });

  if (dbItems.length !== menuItemIds.length) {
    return {
      error:
        "Состав корзины устарел после обновления меню. Добавьте блюда заново.",
      staleCart: true,
    };
  }

  const dbMap = new Map(dbItems.map((i) => [i.id, i]));
  const orderItems = items.map((item) => {
    const dbItem = dbMap.get(item.menuItemId)!;
    return {
      menuItemId: dbItem.id,
      quantity: item.quantity,
      price: dbItem.price,
      name: dbItem.name,
    };
  });

  const subtotalAmount = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  if (subtotalAmount < restaurant.minOrder) {
    return {
      error: `Минимальный заказ ${formatPrice(restaurant.minOrder)}`,
    };
  }

  const promoResult = await resolvePromoForOrder(data.promoCode, subtotalAmount);
  if ("error" in promoResult) {
    return { error: promoResult.error, stalePromo: true };
  }

  const discountAmount = promoResult.discountAmount;
  const totalAmount = subtotalAmount - discountAmount;

  const lastOrder = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1;

  const customer = await prisma.customer.upsert({
    where: { phone: guestPhone },
    create: { name: guestName, phone: guestPhone },
    update: { name: guestName },
  });

  const isPickup = parsed.data.orderType === "PICKUP";
  let deliveryStreet: string;
  let pickupLocationId: string | null = null;

  if (isPickup) {
    const location = await prisma.pickupLocation.findFirst({
      where: {
        id: parsed.data.pickupLocationId,
        restaurantId: restaurant.id,
        isActive: true,
      },
    });
    if (!location) {
      return { error: "Выберите действующую точку самовывоза" };
    }
    deliveryStreet = location.address;
    pickupLocationId = location.id;
  } else {
    deliveryStreet = parsed.data.deliveryStreet!.trim();
  }

  const etaMinutes = isPickup ? restaurant.pickupTime : restaurant.deliveryTime;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      guestName,
      guestPhone,
      orderType: parsed.data.orderType,
      restaurantId: restaurant.id,
      pickupLocationId,
      deliveryStreet,
      deliveryApartment: isPickup ? null : parsed.data.deliveryApartment,
      deliveryComment: isPickup ? null : parsed.data.deliveryComment,
      comment: parsed.data.comment,
      subtotalAmount,
      discountAmount,
      promoCodeId: promoResult.promoId,
      promoCodeText: promoResult.promoCodeText,
      totalAmount,
      etaMinutes,
      isPreorder,
      scheduledFor: isPreorder && scheduledFor ? new Date(scheduledFor) : null,
      paymentStatus: "PAID_STUB",
      items: {
        create: orderItems,
      },
      statusHistory: {
        create: { status: "PENDING" },
      },
    },
  });

  if (promoResult.promoId) {
    await prisma.promoCode.update({
      where: { id: promoResult.promoId },
      data: { usedCount: { increment: 1 } },
    });
  }

  revalidatePath("/partner/orders");

  const restaurantOwner = await prisma.restaurant.findUnique({
    where: { id: restaurant.id },
    select: { ownerId: true },
  });

  if (restaurantOwner) {
    await sendPushToUser(restaurantOwner.ownerId, {
      title: "Termiz",
      body: isPreorder
        ? `Предзаказ #${order.orderNumber}`
        : `Новый заказ #${order.orderNumber}`,
      url: "/partner/orders",
    });
  }

  return { success: true, orderId: order.id };
}

export async function updateOrderStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESTAURANT_OWNER") {
    return { error: "Нет доступа" };
  }

  const parsed = orderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Некорректные данные" };
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) {
    return { error: "Ресторан не найден" };
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, restaurantId: restaurant.id },
  });

  if (!order) {
    return { error: "Заказ не найден" };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: parsed.data.status },
  });

  await addStatusHistory(order.id, parsed.data.status);

  await sendPushToOrder(order.id, {
    title: "Termiz",
    body: `Заказ #${order.orderNumber}: ${ORDER_STATUS_LABELS[parsed.data.status]}`,
    url: `/orders/${order.id}`,
  });

  revalidatePath("/partner/orders");
  revalidatePath(`/orders/${order.id}`);

  return { success: true };
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      restaurant: true,
      pickupLocation: true,
    },
  });
}

export async function findOrdersByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) {
    return { error: "Укажите корректный номер телефона" };
  }

  const customer = await prisma.customer.findUnique({
    where: { phone: normalized },
  });

  if (!customer) {
    return { orders: [] };
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      orderType: true,
      createdAt: true,
    },
  });

  return { orders };
}
