"use server";

import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/stores/cart";

export async function syncCartItems(items: CartItem[]) {
  if (items.length === 0) {
    return { items: [] as CartItem[], removed: [] as string[], priceChanged: false };
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: "termiz" },
    select: { id: true },
  });

  if (!restaurant) {
    return { error: "Ресторан не найден" };
  }

  const ids = items.map((i) => i.menuItemId);
  const dbItems = await prisma.menuItem.findMany({
    where: {
      id: { in: ids },
      isAvailable: true,
      category: { restaurantId: restaurant.id },
    },
    select: { id: true, name: true, price: true, imageUrl: true },
  });

  const dbMap = new Map(dbItems.map((i) => [i.id, i]));
  const removed: string[] = [];
  let priceChanged = false;

  const synced = items.flatMap((item) => {
    const dbItem = dbMap.get(item.menuItemId);
    if (!dbItem) {
      removed.push(item.name);
      return [];
    }
    if (dbItem.price !== item.price || dbItem.name !== item.name) {
      priceChanged = true;
    }
    return [
      {
        ...item,
        name: dbItem.name,
        price: dbItem.price,
        imageUrl: dbItem.imageUrl,
      },
    ];
  });

  return { items: synced, removed, priceChanged };
}
