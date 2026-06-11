import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRestaurantHours } from "@/actions/restaurant";
import { CheckoutForm } from "@/components/customer/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [restaurant, hours] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { slug: "termiz" },
      select: {
        minOrder: true,
        pickupTime: true,
        deliveryTime: true,
        pickupLocations: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, address: true },
        },
      },
    }),
    getRestaurantHours("termiz"),
  ]);

  if (!restaurant || !hours) {
    notFound();
  }

  return (
    <CheckoutForm
      pickupLocations={restaurant.pickupLocations}
      pickupTime={restaurant.pickupTime}
      deliveryTime={restaurant.deliveryTime}
      hours={hours}
      minOrder={restaurant.minOrder}
    />
  );
}
