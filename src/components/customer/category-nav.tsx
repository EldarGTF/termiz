"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  categories: { id: string; name: string }[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(cat.id);
        },
        { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [categories]);

  useEffect(() => {
    const tab = tabRefs.current.get(activeId);
    if (tab && scrollRef.current) {
      const container = scrollRef.current;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const scrollLeft = tabLeft - container.clientWidth / 2 + tabWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeId]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, catId: string) {
    e.preventDefault();
    setActiveId(catId);
    const el = document.getElementById(`category-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav className="sticky top-14 z-40 -mt-1 bg-background/95 backdrop-blur-md md:top-16">
      <div className="mx-auto max-w-5xl border-b border-border/50">
        <div
          ref={scrollRef}
          className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide snap-x snap-mandatory md:gap-2 md:px-4 md:py-2.5"
        >
          {categories.map((cat) => (
            <a
              key={cat.id}
              ref={(el) => {
                if (el) tabRefs.current.set(cat.id, el);
              }}
              href={`#category-${cat.id}`}
              onClick={(e) => handleClick(e, cat.id)}
              className={cn(
                "shrink-0 snap-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 active:scale-[0.98] md:px-4 md:py-2.5 md:text-[15px]",
                activeId === cat.id
                  ? "bg-primary font-semibold text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
