"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const promoSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2).transform((v) => v.trim().toUpperCase()),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.coerce.number().int().min(1),
  minOrder: z.coerce.number().int().min(0).default(0),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
});

async function getOwnerRestaurant() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESTAURANT_OWNER") return null;
  return prisma.restaurant.findUnique({ where: { ownerId: session.user.id } });
}

export async function getPartnerPromoCodes() {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return null;

  return prisma.promoCode.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function savePromoCode(formData: FormData) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  const maxUsesRaw = formData.get("maxUses") as string;
  const parsed = promoSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    code: formData.get("code"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minOrder: formData.get("minOrder") ?? 0,
    maxUses: maxUsesRaw ? Number(maxUsesRaw) : null,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.promoCode.updateMany({
      where: { id, restaurantId: restaurant.id },
      data,
    });
  } else {
    await prisma.promoCode.create({
      data: { ...data, restaurantId: restaurant.id },
    });
  }

  revalidatePath("/partner/promos");
  return { success: true };
}

export async function deletePromoCode(id: string) {
  const restaurant = await getOwnerRestaurant();
  if (!restaurant) return { error: "Нет доступа" };

  await prisma.promoCode.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });

  revalidatePath("/partner/promos");
  return { success: true };
}
