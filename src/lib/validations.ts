import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  role: z.enum(["CUSTOMER", "RESTAURANT_OWNER"]),
});

export const checkoutSchema = z
  .object({
    guestName: z.string().min(2, "Укажите имя"),
    guestPhone: z
      .string()
      .min(10, "Укажите телефон")
      .refine((v) => {
        const digits = v.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 11;
      }, "Укажите корректный номер телефона"),
    orderType: z.enum(["DELIVERY", "PICKUP"]),
    pickupLocationId: z.string().optional(),
    deliveryStreet: z.string().optional(),
    deliveryApartment: z.string().optional(),
    deliveryComment: z.string().optional(),
    comment: z.string().optional(),
    scheduledFor: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "DELIVERY") {
      if (!data.deliveryStreet?.trim() || data.deliveryStreet.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите адрес доставки",
          path: ["deliveryStreet"],
        });
      }
    }
    if (data.orderType === "PICKUP" && !data.pickupLocationId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Выберите точку самовывоза",
        path: ["pickupLocationId"],
      });
    }
  });

export const menuCategorySchema = z.object({
  name: z.string().min(1, "Укажите название"),
  sortOrder: z.coerce.number().int().min(0),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  description: z.string().min(1, "Добавьте описание"),
  price: z.coerce.number().int().min(1, "Укажите цену"),
  categoryId: z.string().min(1),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const restaurantSettingsSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  deliveryTime: z.coerce.number().int().min(10),
  pickupTime: z.coerce.number().int().min(5),
  minOrder: z.coerce.number().int().min(0),
  isOpen: z.boolean(),
});

export const workScheduleSchema = z.object({
  workSchedule: z.string().min(2),
  lastOrderLeadMinutes: z.coerce.number().int().min(0).max(180),
  timezone: z.string().min(3),
  allowPreorders: z.boolean(),
});

export const orderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "DELIVERING",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const orderLookupSchema = z.object({
  phone: z
    .string()
    .min(10, "Укажите телефон")
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }, "Укажите корректный номер телефона"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
