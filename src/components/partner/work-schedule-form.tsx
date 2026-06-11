"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveWorkSchedule } from "@/actions/menu";
import {
  DAY_LABELS,
  DEFAULT_WORK_SCHEDULE,
  parseWorkSchedule,
  type WorkDaySchedule,
} from "@/lib/restaurant-hours";
import type { Restaurant } from "@prisma/client";

export function WorkScheduleForm({ restaurant }: { restaurant: Restaurant }) {
  const [isPending, startTransition] = useTransition();
  const [schedule, setSchedule] = useState<WorkDaySchedule[]>(
    parseWorkSchedule(restaurant.workSchedule),
  );

  function updateDay(index: number, patch: Partial<WorkDaySchedule>) {
    setSchedule((prev) =>
      prev.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    );
  }

  function resetDefaults() {
    setSchedule(DEFAULT_WORK_SCHEDULE);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("workSchedule", JSON.stringify(schedule));
        startTransition(() => {
          void saveWorkSchedule(formData);
        });
      }}
      className="space-y-4 rounded-2xl border border-border bg-white p-5"
    >
      <div>
        <h2 className="font-display text-lg font-bold">График работы</h2>
        <p className="mt-1 text-sm text-muted">
          Время последнего заказа — когда перестаём принимать заказы на сегодня.
        </p>
      </div>

      <div className="space-y-3">
        {schedule.map((day, index) => (
          <div
            key={day.dayOfWeek}
            className="rounded-xl border border-border/70 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{DAY_LABELS[day.dayOfWeek]}</span>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={day.isClosed}
                  onChange={(e) => updateDay(index, { isClosed: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                Выходной
              </label>
            </div>

            {!day.isClosed && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Открытие</Label>
                  <Input
                    type="time"
                    value={day.openTime}
                    onChange={(e) => updateDay(index, { openTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Закрытие</Label>
                  <Input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) => updateDay(index, { closeTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Последний заказ</Label>
                  <Input
                    type="time"
                    value={day.lastOrderTime ?? ""}
                    onChange={(e) =>
                      updateDay(index, {
                        lastOrderTime: e.target.value || null,
                      })
                    }
                    placeholder="Авто"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lastOrderLeadMinutes">Запас до закрытия (мин)</Label>
          <Input
            id="lastOrderLeadMinutes"
            name="lastOrderLeadMinutes"
            type="number"
            min={0}
            max={180}
            defaultValue={restaurant.lastOrderLeadMinutes}
          />
          <p className="text-xs text-muted">
            Если «Последний заказ» не указан — закрытие минус это время.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Часовой пояс</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={restaurant.timezone}
            placeholder="Asia/Almaty"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="allowPreorders"
          defaultChecked={restaurant.allowPreorders}
          className="h-4 w-4 rounded accent-primary"
        />
        Принимать предзаказы вне рабочего времени
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Сохраняем..." : "Сохранить график"}
        </Button>
        <Button type="button" variant="outline" onClick={resetDefaults}>
          Сбросить шаблон
        </Button>
      </div>
    </form>
  );
}
