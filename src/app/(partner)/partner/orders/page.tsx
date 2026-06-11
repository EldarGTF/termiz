import { getPartnerRestaurant } from "@/actions/menu";
import { redirect } from "next/navigation";
import { PartnerOrdersList } from "@/components/partner/partner-orders-list";

export default async function PartnerOrdersPage() {
  const restaurant = await getPartnerRestaurant();
  if (!restaurant) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">Заказы</h1>
      <p className="mt-1 text-muted">Управление входящими заказами</p>
      <div className="mt-6">
        <PartnerOrdersList initialOrders={restaurant.orders} />
      </div>
    </div>
  );
}
