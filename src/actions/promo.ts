"use server";

import { prisma } from "@/lib/prisma";
import {
  calculatePromoDiscount,
  normalizePromoCode,
  PROMO_ERROR_MESSAGES,
  validatePromoForOrder,
} from "@/lib/promo";
import { formatPrice } from "@/lib/utils";

export async function applyPromoCode(code: string, subtotal: number) {
  const normalized = normalizePromoCode(code);

  if (!normalized) {
    return { error: "Введите промокод" };
  }

  if (subtotal <= 0) {
    return { error: "Корзина пуста" };
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: normalized },
  });

  if (!promo) {
    return { error: PROMO_ERROR_MESSAGES.not_found };
  }

  const validationError = validatePromoForOrder(promo, subtotal);
  if (validationError) {
    if (validationError === "min_order") {
      return {
        error: `Минимум ${formatPrice(promo.minOrder)} для промокода ${promo.code}`,
      };
    }
    return { error: PROMO_ERROR_MESSAGES[validationError] };
  }

  const discountAmount = calculatePromoDiscount(promo, subtotal);

  return {
    success: true as const,
    code: promo.code,
    discountAmount,
    totalAmount: subtotal - discountAmount,
  };
}

export async function resolvePromoForOrder(code: string | undefined, subtotal: number) {
  if (!code?.trim()) {
    return { discountAmount: 0, promoId: null as string | null, promoCodeText: null as string | null };
  }

  const result = await applyPromoCode(code, subtotal);
  if ("error" in result) {
    return { error: result.error };
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: result.code },
    select: { id: true },
  });

  if (!promo) {
    return { error: PROMO_ERROR_MESSAGES.not_found };
  }

  return {
    discountAmount: result.discountAmount,
    promoId: promo.id,
    promoCodeText: result.code,
    totalAmount: result.totalAmount,
  };
}
