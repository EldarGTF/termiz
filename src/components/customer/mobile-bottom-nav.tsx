"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, ClipboardList, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/stores/cart";

const tabs = [
  { href: "/", label: "Меню", icon: UtensilsCrossed, match: (p: string) => p === "/" },
  { href: "/orders", label: "Заказы", icon: ClipboardList, match: (p: string) => p === "/orders" },
  { href: "/cart", label: "Корзина", icon: ShoppingBag, match: (p: string) => p === "/cart" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const totalItems = useCartStore((s) => s.totalItems());

  const hidden =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/orders/");

  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Мобильная навигация"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          const isCart = href === "/cart";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-200 active:scale-95",
                active ? "text-primary" : "text-muted",
              )}
            >
              <span className="relative">
                <Icon className={cn("h-6 w-6", active && "stroke-[2.5]")} />
                {isCart && hydrated && totalItems > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </span>
              <span className={cn("text-[10px] font-semibold", active && "text-primary")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
