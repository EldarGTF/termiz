"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  menuCategorySchema,
  menuItemSchema,
  restaurantSettingsSchema,
  workScheduleSchema,
} from "@/lib/validations";
import { parseWorkSchedule } from "@/lib/restaurant-hours";

async function getOwnerRestaurant() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESTAURANT_OWNER") {
    return null;
  }

  return prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
  });
}

export async function getRestaurantMenu(slug = "termiz") {
  return prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

export async function saveMenuCategory(formData: FormData) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  const parsed = menuCategorySchema.safeParse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const id = formData.get("id") as string | null;

  if (id) {
    await prisma.menuCategory.update({
      where: { id },
      data: parsed.data,
    });
  } else {
    await prisma.menuCategory.create({
      data: { ...parsed.data, restaurantId: restaurant.id },
    });
  }

  revalidatePath("/");
  revalidatePath("/partner/menu");
  return { success: true };
}

export async function saveMenuItem(formData: FormData) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl") || undefined,
    isAvailable: formData.get("isAvailable") === "on",
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const id = formData.get("id") as string | null;

  if (id) {
    await prisma.menuItem.update({
      where: { id },
      data: parsed.data,
    });
  } else {
    await prisma.menuItem.create({ data: parsed.data });
  }

  revalidatePath("/");
  revalidatePath("/partner/menu");
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/partner/menu");
  return { success: true };
}

export async function toggleMenuItemAvailability(id: string, isAvailable: boolean) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });

  revalidatePath("/");
  revalidatePath("/partner/menu");
  return { success: true };
}

export async function saveRestaurantSettings(formData: FormData) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  const parsed = restaurantSettingsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    deliveryTime: formData.get("deliveryTime"),
    pickupTime: formData.get("pickupTime"),
    minOrder: formData.get("minOrder"),
    isOpen: formData.get("isOpen") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: parsed.data,
  });

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/partner/settings");
  return { success: true };
}

export async function saveWorkSchedule(formData: FormData) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  const parsed = workScheduleSchema.safeParse({
    workSchedule: formData.get("workSchedule"),
    lastOrderLeadMinutes: formData.get("lastOrderLeadMinutes"),
    timezone: formData.get("timezone"),
    allowPreorders: formData.get("allowPreorders") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const schedule = parseWorkSchedule(parsed.data.workSchedule);

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      workSchedule: JSON.stringify(schedule),
      lastOrderLeadMinutes: parsed.data.lastOrderLeadMinutes,
      timezone: parsed.data.timezone,
      allowPreorders: parsed.data.allowPreorders,
    },
  });

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/partner/settings");
  return { success: true };
}

export async function getPartnerRestaurant() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESTAURANT_OWNER") {
    return null;
  }

  return prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true, user: true, pickupLocation: true },
      },
      pickupLocations: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
