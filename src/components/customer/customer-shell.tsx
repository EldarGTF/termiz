"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CustomerHeader } from "@/components/customer/customer-header";
import { MobileBottomNav } from "@/components/customer/mobile-bottom-nav";

const NO_BOTTOM_NAV = ["/checkout", "/login", "/orders"];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav = NO_BOTTOM_NAV.some((p) => pathname.startsWith(p));

  return (
    <div
      className={cn(
        "min-h-screen bg-background md:pb-8",
        hideBottomNav
          ? "pb-[env(safe-area-inset-bottom,0px)]"
          : "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]",
      )}
    >
      <CustomerHeader />
      {children}
      <MobileBottomNav />
    </div>
  );
}
