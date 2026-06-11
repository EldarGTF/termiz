"use server";

import { prisma } from "@/lib/prisma";
import {
  getRestaurantHoursInfo,
  type RestaurantHoursInfo,
} from "@/lib/restaurant-hours";

const HOURS_SELECT = {
  isOpen: true,
  allowPreorders: true,
  lastOrderLeadMinutes: true,
  timezone: true,
  workSchedule: true,
} as const;

export async function getRestaurantInfo(slug = "termiz") {
  return prisma.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      minOrder: true,
      deliveryTime: true,
      pickupTime: true,
      ...HOURS_SELECT,
    },
  });
}

export async function getRestaurantHours(slug = "termiz"): Promise<RestaurantHoursInfo | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: HOURS_SELECT,
  });

  if (!restaurant) return null;

  return getRestaurantHoursInfo(restaurant);
}
