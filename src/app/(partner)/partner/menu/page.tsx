import { getPartnerRestaurant } from "@/actions/menu";
import { redirect } from "next/navigation";
import { MenuManager } from "@/components/partner/menu-manager";

export default async function PartnerMenuPage() {
  const restaurant = await getPartnerRestaurant();
  if (!restaurant) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">Управление меню</h1>
      <p className="mt-1 text-muted">Категории и блюда</p>
      <div className="mt-6">
        <MenuManager restaurant={restaurant} />
      </div>
    </div>
  );
}
