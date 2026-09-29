import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  className?: string;
}

export function KpiCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 space-y-3", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function ChartSkeleton({ className, height = 240 }: LoadingSkeletonProps & { height?: number }) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 space-y-4", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className={cn("w-full rounded-md")} style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5, className }: LoadingSkeletonProps & { rows?: number; cols?: number }) {
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b bg-muted/50 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-b last:border-0 px-4 py-3 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-4 flex-1", c === 0 && "w-24 flex-none")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

export function InlineSkeleton({ className }: LoadingSkeletonProps) {
  return <Skeleton className={cn("h-4 w-24 inline-block", className)} />;
}
