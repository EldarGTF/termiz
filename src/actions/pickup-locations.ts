"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pickupLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Укажите название"),
  address: z.string().min(5, "Укажите адрес"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

async function getOwnerRestaurant() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESTAURANT_OWNER") return null;
  return prisma.restaurant.findUnique({ where: { ownerId: session.user.id } });
}

export async function savePickupLocation(formData: FormData) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  const parsed = pickupLocationSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    name: formData.get("name"),
    address: formData.get("address"),
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.pickupLocation.updateMany({
      where: { id, restaurantId: restaurant.id },
      data,
    });
  } else {
    await prisma.pickupLocation.create({
      data: { ...data, restaurantId: restaurant.id },
    });
  }

  revalidatePath("/checkout");
  revalidatePath("/partner/settings");
  return { success: true };
}

export async function deletePickupLocation(id: string) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  await prisma.pickupLocation.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });

  revalidatePath("/checkout");
  revalidatePath("/partner/settings");
  return { success: true };
}
