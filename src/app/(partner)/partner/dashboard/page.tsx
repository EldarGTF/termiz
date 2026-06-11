import { getPartnerRestaurant } from "@/actions/menu";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";

export default async function PartnerDashboardPage() {
  const restaurant = await getPartnerRestaurant();
  if (!restaurant) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = restaurant.orders.filter(
    (o) => new Date(o.createdAt) >= today,
  );
  const activeOrders = restaurant.orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
  );
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">Дашборд</h1>
      <p className="mt-1 text-muted">{restaurant.name}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">
              Заказов сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{todayOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">
              Активные заказы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">
              Выручка сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(todayRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Последние заказы</h2>
          <Link href="/partner/orders" className="text-sm text-primary hover:underline">
            Все заказы →
          </Link>
        </div>
        <div className="space-y-3">
          {restaurant.orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3"
            >
              <div>
                <span className="font-medium">#{order.orderNumber}</span>
                <span className="ml-2 text-sm text-muted">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <span className="font-semibold text-primary">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
