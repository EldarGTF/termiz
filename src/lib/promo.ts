import type { PromoCode, PromoDiscountType } from "@prisma/client";

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase();
}

export function calculatePromoDiscount(
  promo: Pick<PromoCode, "discountType" | "discountValue">,
  subtotal: number,
) {
  if (promo.discountType === "PERCENT") {
    return Math.min(subtotal, Math.round((subtotal * promo.discountValue) / 100));
  }
  return Math.min(subtotal, promo.discountValue);
}

export type PromoValidationError =
  | "not_found"
  | "inactive"
  | "expired"
  | "max_uses"
  | "min_order";

export function validatePromoForOrder(
  promo: PromoCode,
  subtotal: number,
  now = new Date(),
): PromoValidationError | null {
  if (!promo.isActive) return "inactive";
  if (promo.expiresAt && promo.expiresAt < now) return "expired";
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return "max_uses";
  if (subtotal < promo.minOrder) return "min_order";
  return null;
}

export const PROMO_ERROR_MESSAGES: Record<PromoValidationError, string> = {
  not_found: "Промокод не найден",
  inactive: "Промокод недействителен",
  expired: "Срок действия промокода истёк",
  max_uses: "Промокод больше не действует",
  min_order: "Сумма заказа недостаточна для этого промокода",
};

export function promoDiscountLabel(type: PromoDiscountType, value: number) {
  return type === "PERCENT" ? `−${value}%` : `−${value} ₸`;
}
