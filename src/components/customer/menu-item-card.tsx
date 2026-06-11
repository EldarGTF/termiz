"use client";

import { motion } from "framer-motion";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { getFoodGradient } from "@/lib/food-placeholder";
import { useCartStore } from "@/stores/cart";

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  index: number;
  canOrder?: boolean;
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  imageUrl,
  index,
  canOrder = true,
}: MenuItemCardProps) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const gradient = getFoodGradient(name);

  const cartItem = items.find((i) => i.menuItemId === id);
  const quantity = cartItem?.quantity ?? 0;

  function handleAdd() {
    if (!canOrder) return;
    addItem({ menuItemId: id, name, price, imageUrl });
  }

  const disabled = !canOrder;

  const imageBlock = (
    <div className="relative shrink-0 overflow-hidden rounded-xl md:rounded-none md:h-44 md:w-full">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-24 w-24 object-cover md:h-full md:w-full md:transition-transform md:duration-300 md:group-hover:scale-105"
        />
      ) : (
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center bg-gradient-to-br md:h-full md:w-full",
            gradient,
          )}
        >
          <UtensilsCrossed className="h-8 w-8 text-white/40 md:h-12 md:w-12" />
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleAdd}
        className="absolute bottom-3 right-3 hidden h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-lg hover:bg-primary hover:text-white md:flex disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Добавить ${name} в корзину`}
        disabled={disabled}
      >
        <Plus className="h-5 w-5" />
      </motion.button>
    </div>
  );

  const quantityControls =
    quantity > 0 ? (
      <div className="flex items-center gap-1 rounded-xl bg-primary-light p-1">
        <button
          onClick={() => updateQuantity(id, quantity - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary active:scale-95 md:h-10 md:w-10"
          aria-label="Уменьшить"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm font-bold text-primary">{quantity}</span>
        <button
          onClick={handleAdd}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white active:scale-95 md:h-10 md:w-10"
          aria-label="Увеличить"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <button
        onClick={handleAdd}
        className="flex h-9 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
        aria-label={`Добавить ${name} в корзину`}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        В корзину
      </button>
    );

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
      className="group overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[var(--shadow-card)] md:rounded-3xl md:hover:shadow-lg"
    >
      <div className="flex gap-3 p-3 md:flex-col md:gap-0 md:p-0">
        {imageBlock}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 md:p-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-bold leading-tight md:text-lg">{name}</h3>
              <span className="hidden shrink-0 rounded-xl bg-primary-light px-3 py-1 text-sm font-bold text-primary md:inline">
                {formatPrice(price)}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted md:mt-2 md:text-sm">
              {description}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 md:mt-0 md:hidden">
            <span className="text-base font-bold text-primary">{formatPrice(price)}</span>
            {quantityControls}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
