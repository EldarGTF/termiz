"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

/** Desktop-only floating cart; mobile uses bottom nav */
export function FloatingCartButton() {
  const hydrated = useHydrated();
  const totalAmount = useCartStore((s) => s.totalAmount());
  const totalItems = useCartStore((s) => s.totalItems());

  if (!hydrated) return null;

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-8 left-4 right-4 z-50 mx-auto hidden max-w-5xl md:block"
        >
          <Link
            href="/cart"
            className="flex items-center justify-between gap-4 rounded-3xl bg-primary px-6 py-4 text-white shadow-[var(--shadow-float)] hover:bg-primary-hover"
          >
            <span className="flex items-center gap-3 font-semibold">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm text-white/80">Корзина</span>
                <span className="font-bold">{totalItems} поз.</span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg font-bold">{formatPrice(totalAmount)}</span>
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
