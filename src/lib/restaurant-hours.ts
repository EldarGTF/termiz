export const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

export interface WorkDaySchedule {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  lastOrderTime: string | null;
}

export interface PreorderSlot {
  iso: string;
  label: string;
}

export type RestaurantStatusMode =
  | "open"
  | "closing_soon"
  | "closed_preorder"
  | "closed";

export interface RestaurantHoursInfo {
  mode: RestaurantStatusMode;
  acceptingOrders: boolean;
  allowPreorders: boolean;
  canOrder: boolean;
  isManuallyClosed: boolean;
  statusLabel: string;
  statusDetail: string;
  lastOrderTimeToday: string | null;
  closeTimeToday: string | null;
  openTimeToday: string | null;
  scheduleSummary: string;
  preorderSlots: PreorderSlot[];
}

export interface RestaurantHoursInput {
  isOpen: boolean;
  allowPreorders: boolean;
  lastOrderLeadMinutes: number;
  timezone: string;
  workSchedule: string | null;
}

export const DEFAULT_WORK_SCHEDULE: WorkDaySchedule[] = [
  { dayOfWeek: 0, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
  { dayOfWeek: 1, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
  { dayOfWeek: 2, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
  { dayOfWeek: 3, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
  { dayOfWeek: 4, isClosed: false, openTime: "10:00", closeTime: "23:00", lastOrderTime: "22:30" },
  { dayOfWeek: 5, isClosed: false, openTime: "10:00", closeTime: "23:00", lastOrderTime: "22:30" },
  { dayOfWeek: 6, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
];

export function parseWorkSchedule(raw: string | null | undefined): WorkDaySchedule[] {
  if (!raw) return DEFAULT_WORK_SCHEDULE;
  try {
    const parsed = JSON.parse(raw) as WorkDaySchedule[];
    if (!Array.isArray(parsed) || parsed.length !== 7) {
      return DEFAULT_WORK_SCHEDULE;
    }
    return parsed.map((day, index) => ({
      dayOfWeek: typeof day.dayOfWeek === "number" ? day.dayOfWeek : index,
      isClosed: Boolean(day.isClosed),
      openTime: day.openTime || "10:00",
      closeTime: day.closeTime || "22:00",
      lastOrderTime: day.lastOrderTime || null,
    }));
  } catch {
    return DEFAULT_WORK_SCHEDULE;
  }
}

export function serializeWorkSchedule(schedule: WorkDaySchedule[]): string {
  return JSON.stringify(schedule);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  return `${h}:${m ?? "00"}`;
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function getScheduleDayOfWeek(date: Date, timeZone: string) {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" })
    .format(date)
    .slice(0, 3);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return map[weekday] ?? 0;
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = getZonedParts(guess, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  const offset = asUtc - target;
  return new Date(target - offset);
}

function addDaysToParts(
  year: number,
  month: number,
  day: number,
  offset: number,
) {
  const d = new Date(Date.UTC(year, month - 1, day + offset));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function getLastOrderMinutes(day: WorkDaySchedule, leadMinutes: number) {
  if (day.lastOrderTime) return timeToMinutes(day.lastOrderTime);
  return Math.max(timeToMinutes(day.openTime), timeToMinutes(day.closeTime) - leadMinutes);
}

function formatSlotLabel(date: Date, timeZone: string) {
  const now = new Date();
  const today = getZonedParts(now, timeZone);
  const slot = getZonedParts(date, timeZone);

  const isToday =
    today.year === slot.year && today.month === slot.month && today.day === slot.day;

  const tomorrowParts = addDaysToParts(today.year, today.month, today.day, 1);
  const isTomorrow =
    tomorrowParts.year === slot.year &&
    tomorrowParts.month === slot.month &&
    tomorrowParts.day === slot.day;

  const time = new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (isToday) return `Сегодня, ${time}`;
  if (isTomorrow) return `Завтра, ${time}`;

  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);

  return `${dateLabel}, ${time}`;
}

export function buildScheduleSummary(schedule: WorkDaySchedule[]): string {
  const openDays = schedule.filter((d) => !d.isClosed);
  if (openDays.length === 0) return "Закрыто";

  const first = openDays[0];
  const sameHours = openDays.every(
    (d) =>
      d.openTime === first.openTime &&
      d.closeTime === first.closeTime &&
      d.lastOrderTime === first.lastOrderTime,
  );

  if (sameHours && openDays.length === 7) {
    const last = first.lastOrderTime ?? null;
    return last
      ? `Ежедневно ${first.openTime}–${first.closeTime}, заказы до ${last}`
      : `Ежедневно ${first.openTime}–${first.closeTime}`;
  }

  return openDays
    .map((d) => {
      const last = d.lastOrderTime ? `, заказы до ${d.lastOrderTime}` : "";
      return `${DAY_LABELS[d.dayOfWeek]} ${d.openTime}–${d.closeTime}${last}`;
    })
    .join(" · ");
}

export function generatePreorderSlots(
  schedule: WorkDaySchedule[],
  timeZone: string,
  maxSlots = 12,
): PreorderSlot[] {
  const slots: PreorderSlot[] = [];
  const now = new Date();
  const today = getZonedParts(now, timeZone);

  for (let offset = 0; offset < 21 && slots.length < maxSlots; offset++) {
    const dateParts = addDaysToParts(today.year, today.month, today.day, offset);
    const scheduleDay = getScheduleDayOfWeek(
      zonedDateTimeToUtc(dateParts.year, dateParts.month, dateParts.day, 12, 0, timeZone),
      timeZone,
    );
    const day = schedule.find((d) => d.dayOfWeek === scheduleDay);
    if (!day || day.isClosed) continue;

    const [openH, openM] = day.openTime.split(":").map(Number);
    const slotDate = zonedDateTimeToUtc(
      dateParts.year,
      dateParts.month,
      dateParts.day,
      openH,
      openM || 0,
      timeZone,
    );

    if (slotDate.getTime() <= now.getTime() + 60_000) continue;

    slots.push({
      iso: slotDate.toISOString(),
      label: formatSlotLabel(slotDate, timeZone),
    });
  }

  return slots;
}

export function getRestaurantHoursInfo(
  restaurant: RestaurantHoursInput,
  now = new Date(),
): RestaurantHoursInfo {
  const schedule = parseWorkSchedule(restaurant.workSchedule);
  const timeZone = restaurant.timezone || "Asia/Almaty";
  const parts = getZonedParts(now, timeZone);
  const nowMinutes = parts.hour * 60 + parts.minute;
  const scheduleDay = getScheduleDayOfWeek(now, timeZone);
  const today = schedule.find((d) => d.dayOfWeek === scheduleDay) ?? null;

  const allowPreorders = restaurant.allowPreorders;
  const scheduleSummary = buildScheduleSummary(schedule);
  const preorderSlots = allowPreorders ? generatePreorderSlots(schedule, timeZone) : [];

  if (!restaurant.isOpen) {
    return {
      mode: allowPreorders ? "closed_preorder" : "closed",
      acceptingOrders: false,
      allowPreorders,
      canOrder: allowPreorders && preorderSlots.length > 0,
      isManuallyClosed: true,
      statusLabel: allowPreorders ? "Закрыто · предзаказ" : "Закрыто",
      statusDetail: allowPreorders
        ? "Сейчас не принимаем заказы. Можно оформить предзаказ на открытие."
        : "Ресторан временно не принимает заказы.",
      lastOrderTimeToday: today?.lastOrderTime ?? null,
      closeTimeToday: today?.isClosed ? null : today?.closeTime ?? null,
      openTimeToday: today?.isClosed ? null : today?.openTime ?? null,
      scheduleSummary,
      preorderSlots,
    };
  }

  if (!today || today.isClosed) {
    return {
      mode: allowPreorders ? "closed_preorder" : "closed",
      acceptingOrders: false,
      allowPreorders,
      canOrder: allowPreorders && preorderSlots.length > 0,
      isManuallyClosed: false,
      statusLabel: allowPreorders ? "Выходной · предзаказ" : "Выходной",
      statusDetail: allowPreorders
        ? "Сегодня не работаем. Оформите предзаказ на ближайший рабочий день."
        : "Сегодня ресторан не работает.",
      lastOrderTimeToday: null,
      closeTimeToday: null,
      openTimeToday: null,
      scheduleSummary,
      preorderSlots,
    };
  }

  const openMinutes = timeToMinutes(today.openTime);
  const lastOrderMinutes = getLastOrderMinutes(today, restaurant.lastOrderLeadMinutes);
  const lastOrderTimeToday = formatTime(
    `${Math.floor(lastOrderMinutes / 60)}:${String(lastOrderMinutes % 60).padStart(2, "0")}`,
  );

  if (nowMinutes < openMinutes) {
    return {
      mode: allowPreorders ? "closed_preorder" : "closed",
      acceptingOrders: false,
      allowPreorders,
      canOrder: allowPreorders && preorderSlots.length > 0,
      isManuallyClosed: false,
      statusLabel: allowPreorders ? "Откроемся · предзаказ" : "Закрыто",
      statusDetail: allowPreorders
        ? `Откроемся в ${today.openTime}. Можно оформить предзаказ.`
        : `Откроемся в ${today.openTime}.`,
      lastOrderTimeToday,
      closeTimeToday: today.closeTime,
      openTimeToday: today.openTime,
      scheduleSummary,
      preorderSlots,
    };
  }

  if (nowMinutes >= lastOrderMinutes) {
    return {
      mode: allowPreorders ? "closed_preorder" : "closed",
      acceptingOrders: false,
      allowPreorders,
      canOrder: allowPreorders && preorderSlots.length > 0,
      isManuallyClosed: false,
      statusLabel: allowPreorders ? "Закрыто · предзаказ" : "Приём заказов завершён",
      statusDetail: allowPreorders
        ? `Сегодня заказы принимали до ${lastOrderTimeToday}. Оформите предзаказ на открытие.`
        : `Сегодня заказы принимали до ${lastOrderTimeToday}.`,
      lastOrderTimeToday,
      closeTimeToday: today.closeTime,
      openTimeToday: today.openTime,
      scheduleSummary,
      preorderSlots,
    };
  }

  const minutesToLastOrder = lastOrderMinutes - nowMinutes;
  const closingSoon = minutesToLastOrder <= 30;

  return {
    mode: closingSoon ? "closing_soon" : "open",
    acceptingOrders: true,
    allowPreorders,
    canOrder: true,
    isManuallyClosed: false,
    statusLabel: closingSoon ? "Скоро закроемся" : "Открыто",
    statusDetail: closingSoon
      ? `Заказы принимаем до ${lastOrderTimeToday}`
      : `Работаем до ${today.closeTime}, заказы до ${lastOrderTimeToday}`,
    lastOrderTimeToday,
    closeTimeToday: today.closeTime,
    openTimeToday: today.openTime,
    scheduleSummary,
    preorderSlots,
  };
}

export function isValidPreorderSlot(
  scheduledFor: string,
  slots: PreorderSlot[],
): boolean {
  const target = new Date(scheduledFor).getTime();
  return slots.some((slot) => Math.abs(new Date(slot.iso).getTime() - target) < 60_000);
}
