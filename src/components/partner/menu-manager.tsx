"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveMenuCategory,
  saveMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "@/actions/menu";
import { formatPrice } from "@/lib/utils";
import type { Restaurant, MenuCategory, MenuItem } from "@prisma/client";

type RestaurantWithMenu = Restaurant & {
  categories: (MenuCategory & { items: MenuItem[] })[];
};

export function MenuManager({ restaurant }: { restaurant: RestaurantWithMenu }) {
  const [isPending, startTransition] = useTransition();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Button onClick={() => setShowCategoryForm(!showCategoryForm)}>
        {showCategoryForm ? "Отмена" : "+ Категория"}
      </Button>

      {showCategoryForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => void saveMenuCategory(new FormData(e.currentTarget)));
          }}
          className="rounded-2xl border border-border bg-white p-5 space-y-3"
        >
          <div className="space-y-2">
            <Label>Название категории</Label>
            <Input name="name" required />
          </div>
          <input type="hidden" name="sortOrder" value={restaurant.categories.length} />
          <Button type="submit" disabled={isPending}>Сохранить</Button>
        </form>
      )}

      {restaurant.categories.map((category) => {
        const editingItem = category.items.find((i) => i.id === editingItemId);

        return (
          <div key={category.id} className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowItemForm(showItemForm === category.id ? null : category.id);
                  setEditingItemId(null);
                }}
              >
                + Блюдо
              </Button>
            </div>

            {showItemForm === category.id && !editingItem && (
              <ItemForm
                categoryId={category.id}
                sortOrder={category.items.length}
                isPending={isPending}
                onSubmit={(fd) => startTransition(() => void saveMenuItem(fd))}
                onDone={() => setShowItemForm(null)}
              />
            )}

            {editingItem && (
              <ItemForm
                categoryId={category.id}
                item={editingItem}
                sortOrder={editingItem.sortOrder}
                isPending={isPending}
                onSubmit={(fd) => startTransition(() => void saveMenuItem(fd))}
                onDone={() => setEditingItemId(null)}
              />
            )}

            <ul className="mt-4 space-y-2">
              {category.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted">{formatPrice(item.price)}</p>
                    {item.imageUrl && (
                      <p className="truncate text-xs text-muted">{item.imageUrl}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingItemId(item.id);
                        setShowItemForm(null);
                      }}
                    >
                      Изменить
                    </Button>
                    <Button
                      size="sm"
                      variant={item.isAvailable ? "secondary" : "outline"}
                      onClick={() =>
                        startTransition(() =>
                          void toggleMenuItemAvailability(item.id, !item.isAvailable),
                        )
                      }
                    >
                      {item.isAvailable ? "В наличии" : "Нет"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => startTransition(() => void deleteMenuItem(item.id))}
                    >
                      Удалить
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ItemForm({
  categoryId,
  item,
  sortOrder,
  isPending,
  onSubmit,
  onDone,
}: {
  categoryId: string;
  item?: MenuItem;
  sortOrder: number;
  isPending: boolean;
  onSubmit: (fd: FormData) => void;
  onDone: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("categoryId", categoryId);
        onSubmit(fd);
        onDone();
      }}
      className="mt-4 space-y-3 rounded-xl bg-surface p-4"
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <Input name="name" placeholder="Название" defaultValue={item?.name} required />
      <Input name="description" placeholder="Описание" defaultValue={item?.description} required />
      <Input name="price" type="number" placeholder="Цена" defaultValue={item?.price} required />
      <div className="space-y-2">
        <Label>URL фото</Label>
        <Input name="imageUrl" placeholder="https://..." defaultValue={item?.imageUrl ?? ""} />
      </div>
      <input type="hidden" name="isAvailable" value={item?.isAvailable === false ? "" : "on"} />
      <input type="hidden" name="sortOrder" value={sortOrder} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {item ? "Сохранить" : "Добавить"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
