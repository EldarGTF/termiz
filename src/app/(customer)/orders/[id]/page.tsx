import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/orders";
import { OrderTracking } from "@/components/customer/order-tracking";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { OrderPushSubscribe } from "@/components/customer/order-push-subscribe";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 md:px-4 md:py-8">
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        ← К меню
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold">Заказ #{order.orderNumber}</h1>
      <p className="mt-1 text-sm text-muted">{formatDate(order.createdAt)}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{ORDER_TYPE_LABELS[order.orderType]}</Badge>
        {order.isPreorder && <Badge variant="warning">Предзаказ</Badge>}
      </div>

      {order.isPreorder && order.scheduledFor && (
        <p className="mt-3 rounded-xl bg-primary-light px-4 py-3 text-sm">
          Подготовим к <span className="font-semibold">{formatDate(order.scheduledFor)}</span>
        </p>
      )}

      <p className="mt-4 rounded-2xl bg-primary-light px-4 py-3 text-sm text-muted">
        Сохраните эту страницу — по ссылке можно отслеживать статус заказа.
      </p>

      <div className="mt-6 rounded-3xl border border-border/80 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-4 font-display text-lg font-bold">Статус заказа</h2>
        <OrderTracking
          orderId={order.id}
          initialStatus={order.status}
          orderType={order.orderType}
          etaMinutes={order.etaMinutes}
        />
      </div>

      <div className="mt-4 rounded-3xl border border-border/80 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-3 font-display text-lg font-bold">Состав заказа</h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold">
          <span>Итого</span>
          <span className="text-primary">{formatPrice(order.totalAmount)}</span>
        </div>
        {order.discountAmount > 0 && (
          <p className="mt-2 text-xs text-green-700">
            Промокод {order.promoCodeText}: −{formatPrice(order.discountAmount)}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-3xl border border-border/80 bg-white p-6 text-sm shadow-[var(--shadow-card)]">
        {order.guestName && (
          <>
            <p className="text-muted">Имя</p>
            <p className="mt-1 font-medium">{order.guestName}</p>
          </>
        )}
        {order.guestPhone && (
          <>
            <p className="mt-3 text-muted">Телефон</p>
            <p className="mt-1 font-medium">{order.guestPhone}</p>
          </>
        )}
        <p className="mt-3 text-muted">
          {order.orderType === "PICKUP" ? "Самовывоз" : "Адрес доставки"}
        </p>
        <p className="mt-1 font-medium">
          {order.pickupLocation && (
            <span className="block font-semibold">{order.pickupLocation.name}</span>
          )}
          {order.deliveryStreet}
          {order.deliveryApartment && `, ${order.deliveryApartment}`}
        </p>
        <p className="mt-3 text-muted">Оплата</p>
        <p className="mt-1 font-medium">При получении</p>
      </div>

      <OrderPushSubscribe orderId={order.id} />
    </div>
  );
}
