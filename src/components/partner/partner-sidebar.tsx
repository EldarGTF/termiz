"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  LogOut,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/partner/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/partner/menu", label: "Меню", icon: UtensilsCrossed },
  { href: "/partner/orders", label: "Заказы", icon: ClipboardList },
  { href: "/partner/promos", label: "Промокоды", icon: Tag },
  { href: "/partner/settings", label: "Настройки", icon: Settings },
];

export function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-r border-border/80 bg-white md:w-64 md:min-h-screen">
      <div className="border-b border-border/80 p-6">
        <Link href="/partner/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-foreground">Termiz</span>
            <p className="text-xs text-muted">Панель ресторана</p>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer",
              pathname === href
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "text-muted hover:bg-primary-light hover:text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="m-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        Выйти
      </button>
    </aside>
  );
}
