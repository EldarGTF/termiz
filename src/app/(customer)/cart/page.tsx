import { getRestaurantHours, getRestaurantInfo } from "@/actions/restaurant";
import { CartPageClient } from "@/components/customer/cart-page-client";
import { notFound } from "next/navigation";

export default async function CartPage() {
  const [restaurant, hours] = await Promise.all([
    getRestaurantInfo(),
    getRestaurantHours(),
  ]);
  if (!restaurant || !hours) notFound();

  return <CartPageClient hours={hours} minOrder={restaurant.minOrder} />;
}
