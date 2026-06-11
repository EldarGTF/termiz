import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variant === "default" && "bg-primary text-white shadow-sm shadow-primary/30",
        variant === "secondary" && "bg-surface-muted text-muted border border-border",
        variant === "success" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
        variant === "warning" && "bg-amber-50 text-amber-700 border border-amber-200",
        className,
      )}
      {...props}
    />
  );
}
