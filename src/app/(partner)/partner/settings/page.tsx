import { getPartnerRestaurant } from "@/actions/menu";
import { redirect } from "next/navigation";
import { RestaurantSettingsForm } from "@/components/partner/restaurant-settings-form";
import { WorkScheduleForm } from "@/components/partner/work-schedule-form";
import { PickupLocationsManager } from "@/components/partner/pickup-locations-manager";

export default async function PartnerSettingsPage() {
  const restaurant = await getPartnerRestaurant();
  if (!restaurant) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="mt-1 text-muted">Информация о ресторане</p>
      </div>
      <div className="max-w-lg">
        <RestaurantSettingsForm restaurant={restaurant} />
      </div>
      <div className="max-w-lg">
        <WorkScheduleForm restaurant={restaurant} />
      </div>
      <div className="max-w-lg">
        <PickupLocationsManager locations={restaurant.pickupLocations} />
      </div>
    </div>
  );
}
