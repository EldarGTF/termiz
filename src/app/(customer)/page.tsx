import { getRestaurantMenu } from "@/actions/menu";
import { getRestaurantHours } from "@/actions/restaurant";
import { RestaurantHero } from "@/components/customer/restaurant-hero";
import { CategoryNav } from "@/components/customer/category-nav";
import { InstallPwaBanner } from "@/components/customer/install-pwa-banner";
import { MenuItemCard } from "@/components/customer/menu-item-card";
import { FloatingCartButton } from "@/components/customer/floating-cart-button";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const [restaurant, hours] = await Promise.all([
    getRestaurantMenu("termiz"),
    getRestaurantHours("termiz"),
  ]);

  if (!restaurant || !hours) {
    notFound();
  }

  const categories = restaurant.categories.filter((c) => c.items.length > 0);

  return (
    <>
      <RestaurantHero
        name={restaurant.name}
        description={restaurant.description}
        rating={restaurant.rating}
        deliveryTime={restaurant.deliveryTime}
        minOrder={restaurant.minOrder}
        hours={hours}
      />
      <CategoryNav
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
      <InstallPwaBanner className="mx-auto mt-3 max-w-5xl px-3 md:px-4" />
      <main className="mx-auto max-w-5xl space-y-8 px-3 py-3 md:space-y-12 md:px-4 md:py-6">
        {categories.map((category) => (
          <section key={category.id} id={`category-${category.id}`} className="scroll-mt-[8.5rem] md:scroll-mt-36">
            <h2 className="mb-3 font-display text-xl font-bold text-foreground md:mb-6 md:text-3xl">
              {category.name}
            </h2>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {category.items.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  imageUrl={item.imageUrl}
                  index={index}
                  canOrder={hours.canOrder}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
      <FloatingCartButton />
    </>
  );
}
