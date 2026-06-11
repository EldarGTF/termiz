"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deletePromoCode, savePromoCode } from "@/actions/partner-promos";
import { formatPrice } from "@/lib/utils";
import type { PromoCode } from "@prisma/client";

export function PromoCodesManager({ promos }: { promos: PromoCode[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const editing = promos.find((p) => p.id === editingId);

  return (
    <div className="space-y-4">
      <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
        {showForm ? "Отмена" : "+ Промокод"}
      </Button>

      {(showForm || editing) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              await savePromoCode(new FormData(e.currentTarget));
              setShowForm(false);
              setEditingId(null);
            });
          }}
          className="space-y-3 rounded-2xl border border-border bg-white p-5"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Код</Label>
              <Input name="code" defaultValue={editing?.code} placeholder="TERMIZ10" required className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label>Тип скидки</Label>
              <select
                name="discountType"
                defaultValue={editing?.discountType ?? "PERCENT"}
                className="flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm"
              >
                <option value="PERCENT">Процент</option>
                <option value="FIXED">Фиксированная (₸)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Значение</Label>
              <Input name="discountValue" type="number" defaultValue={editing?.discountValue ?? 10} required />
            </div>
            <div className="space-y-2">
              <Label>Мин. заказ (₸)</Label>
              <Input name="minOrder" type="number" defaultValue={editing?.minOrder ?? 0} />
            </div>
            <div className="space-y-2">
              <Label>Лимит использований</Label>
              <Input name="maxUses" type="number" defaultValue={editing?.maxUses ?? ""} placeholder="Без лимита" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} className="accent-primary" />
            Активен
          </label>
          <Button type="submit" disabled={isPending}>Сохранить</Button>
        </form>
      )}

      <div className="space-y-3">
        {promos.map((promo) => (
          <div key={promo.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-primary">{promo.code}</p>
                <p className="text-sm text-muted">
                  {promo.discountType === "PERCENT"
                    ? `−${promo.discountValue}%`
                    : `−${formatPrice(promo.discountValue)}`}
                  {" · "}мин. {formatPrice(promo.minOrder)}
                </p>
                <p className="text-xs text-muted">
                  Использовано: {promo.usedCount}
                  {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                  {!promo.isActive && " · неактивен"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingId(promo.id); setShowForm(false); }}>
                  Изменить
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => startTransition(() => void deletePromoCode(promo.id))}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
