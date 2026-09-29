import { cn, getRiskClasses } from "@/lib/utils";
import type { RiskCategory } from "@/types/api";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface RiskBadgeProps {
  category: RiskCategory | string | null | undefined;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const RISK_ICONS = {
  High: AlertTriangle,
  Medium: TrendingUp,
  Low: CheckCircle,
};

export function RiskBadge({ category, showIcon = true, className, size = "md" }: RiskBadgeProps) {
  const classes = getRiskClasses(category);
  const Icon = category && category in RISK_ICONS ? RISK_ICONS[category as keyof typeof RISK_ICONS] : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-md border",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1",
        classes.text,
        classes.bg,
        classes.border,
        className,
      )}
      aria-label={`Risk category: ${category ?? "Unknown"}`}
    >
      {showIcon && Icon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />}
      {category ?? "Unknown"}
    </span>
  );
}

interface PredictionBadgeProps {
  predicted: "Yes" | "No" | string | null | undefined;
  className?: string;
}

export function PredictionBadge({ predicted, className }: PredictionBadgeProps) {
  const isChurn = predicted === "Yes";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium rounded-md border px-2.5 py-1",
        isChurn
          ? "text-rose-700 bg-rose-50 border-rose-200"
          : "text-green-700 bg-green-50 border-green-200",
        className,
      )}
    >
      {isChurn ? "Will Churn" : "Will Retain"}
    </span>
  );
}

interface StatusDotProps {
  status: "ok" | "degraded" | "offline" | "available" | "unavailable";
  label?: string;
  className?: string;
}

export function StatusDot({ status, label, className }: StatusDotProps) {
  const isGood = status === "ok" || status === "available";
  const isWarn = status === "degraded";

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isGood && "bg-green-500",
          isWarn && "bg-amber-500",
          !isGood && !isWarn && "bg-red-500",
        )}
        aria-hidden
      />
      {label ?? (isGood ? "Online" : isWarn ? "Degraded" : "Offline")}
    </span>
  );
}
