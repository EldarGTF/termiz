"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Wallet, Flame } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { RestaurantHoursInfo } from "@/lib/restaurant-hours";

interface RestaurantHeroProps {
  name: string;
  description: string;
  rating: number;
  deliveryTime: number;
  minOrder: number;
  hours: RestaurantHoursInfo;
}

export function RestaurantHero({
  name,
  description,
  rating,
  deliveryTime,
  minOrder,
  hours,
}: RestaurantHeroProps) {
  const badgeVariant =
    hours.mode === "open"
      ? "success"
      : hours.mode === "closing_soon"
        ? "warning"
        : hours.canOrder
          ? "warning"
          : "warning";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-amber-400" />
      <div className="pattern-dots absolute inset-0 opacity-60" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-6 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={badgeVariant} className="bg-white/95 text-foreground shadow-md">
              {hours.statusLabel}
            </Badge>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Flame className="h-3 w-3" />
              ~{deliveryTime} мин
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {name}
          </h1>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/90 md:mt-3 md:line-clamp-none md:text-lg">
            {description}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2.5 md:mt-6 md:flex md:flex-wrap md:gap-4">
            {[
              { icon: Star, label: rating.toFixed(1), sub: "рейтинг" },
              { icon: Clock, label: `${deliveryTime} мин`, sub: "доставка" },
              { icon: Wallet, label: formatPrice(minOrder), sub: "мин." },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={sub}
                className="flex flex-col items-center rounded-2xl bg-white/15 px-3 py-3 backdrop-blur-md md:flex-row md:gap-3 md:px-5 md:py-3.5"
              >
                <Icon className="mb-1.5 h-5 w-5 text-white md:mb-0 md:h-6 md:w-6" />
                <div className="text-center md:text-left">
                  <p className="text-sm font-bold text-white md:text-base">{label}</p>
                  <p className="text-xs text-white/70 md:text-sm">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {hours.mode !== "open" && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-md md:mt-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm leading-snug text-white">
                <p className="font-semibold">{hours.statusDetail}</p>
                <p className="mt-0.5 text-xs text-white/75">{hours.scheduleSummary}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="h-3 rounded-t-[1.25rem] bg-background md:h-5 md:rounded-t-[1.75rem]" />
    </section>
  );
}
