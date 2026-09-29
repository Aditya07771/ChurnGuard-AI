import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  value: string | number | React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  trend?: React.ReactNode;
  className?: string;
  loading?: boolean;
  note?: string;
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
  className,
  loading = false,
  note,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm p-5",
        "transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground leading-none">{title}</p>
        {Icon && (
          <div className={cn("rounded-lg p-2 bg-primary/8", iconClassName)}>
            <Icon className="h-4 w-4 text-primary" aria-hidden />
          </div>
        )}
      </div>
      <div className="space-y-1">
        {loading ? (
          <>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-40 mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold tabular-nums leading-tight">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {note && (
              <p className="text-xs text-muted-foreground/70 italic">{note}</p>
            )}
            {trend && <div className="pt-1">{trend}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export function KpiRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}
