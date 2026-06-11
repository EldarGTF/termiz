"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRestaurantSettings } from "@/actions/menu";
import type { Restaurant } from "@prisma/client";

export function RestaurantSettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => {
          void saveRestaurantSettings(new FormData(e.currentTarget));
        });
      }}
      className="space-y-4 rounded-2xl border border-border bg-white p-5"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Название</Label>
        <Input id="name" name="name" defaultValue={restaurant.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Input id="description" name="description" defaultValue={restaurant.description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deliveryTime">Время доставки (мин)</Label>
        <Input id="deliveryTime" name="deliveryTime" type="number" defaultValue={restaurant.deliveryTime} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pickupTime">Время самовывоза (мин)</Label>
        <Input id="pickupTime" name="pickupTime" type="number" defaultValue={restaurant.pickupTime} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="minOrder">Мин. заказ (₸)</Label>
        <Input id="minOrder" name="minOrder" type="number" defaultValue={restaurant.minOrder} required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isOpen" defaultChecked={restaurant.isOpen} className="h-4 w-4 rounded accent-primary" />
        Принимать заказы сейчас
      </label>
      <p className="text-xs text-muted">
        Снимите галочку для экстренного закрытия. График работы настраивается ниже.
      </p>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Сохраняем..." : "Сохранить"}
      </Button>
    </form>
  );
}
