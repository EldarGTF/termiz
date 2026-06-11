"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwaBanner({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || hidden) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 text-primary" />
        <p className="text-sm font-medium">Установите Termiz на главный экран</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void deferred.prompt()}>
          Установить
        </Button>
        <button onClick={() => setHidden(true)} className="p-2 text-muted" aria-label="Закрыть">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
