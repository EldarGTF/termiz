"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deletePickupLocation, savePickupLocation } from "@/actions/pickup-locations";
import type { PickupLocation } from "@prisma/client";

export function PickupLocationsManager({
  locations,
}: {
  locations: PickupLocation[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const editing = locations.find((l) => l.id === editingId);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Точки самовывоза</h2>
        <Button size="sm" variant="outline" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          {showForm ? "Отмена" : "+ Точка"}
        </Button>
      </div>

      {(showForm || editing) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              await savePickupLocation(new FormData(e.currentTarget));
              setShowForm(false);
              setEditingId(null);
            });
          }}
          className="space-y-3 rounded-xl bg-surface-muted p-4"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="space-y-2">
            <Label>Название</Label>
            <Input name="name" defaultValue={editing?.name} placeholder="Катаева" required />
          </div>
          <div className="space-y-2">
            <Label>Адрес</Label>
            <Input name="address" defaultValue={editing?.address} placeholder="ул. Катаева, 66" required />
          </div>
          <input type="hidden" name="sortOrder" value={editing?.sortOrder ?? locations.length} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} className="accent-primary" />
            Активна
          </label>
          <Button type="submit" size="sm" disabled={isPending}>Сохранить</Button>
        </form>
      )}

      <ul className="space-y-2">
        {locations.map((loc) => (
          <li key={loc.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{loc.name}</p>
              <p className="text-muted">{loc.address}</p>
              {!loc.isActive && <span className="text-xs text-amber-600">Неактивна</span>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditingId(loc.id); setShowForm(false); }}>
                Изменить
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => startTransition(() => void deletePickupLocation(loc.id))}
              >
                Удалить
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
