/**
 * Reusable chart shell — consistent card wrapper with title, description, and empty/unavailable state.
 */
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/feedback/EmptyState";
import { BarChart2, AlertTriangle } from "lucide-react";

interface ChartShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
  empty?: boolean;
  unavailable?: boolean;
  unavailableReason?: string;
  note?: string;
  actions?: React.ReactNode;
}

export function ChartShell({
  title,
  description,
  children,
  className,
  empty = false,
  unavailable = false,
  unavailableReason,
  note,
  actions,
}: ChartShellProps) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="px-5 pt-5 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {unavailable ? (
        <div className="px-5 pb-5">
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Model or data unavailable</p>
              {unavailableReason && (
                <p className="text-xs mt-0.5 text-amber-700">{unavailableReason}</p>
              )}
            </div>
          </div>
        </div>
      ) : empty ? (
        <div className="px-5 pb-5">
          <EmptyState
            icon={BarChart2}
            title="No chart data"
            description="The backend returned no data points for this chart."
            compact
          />
        </div>
      ) : (
        <div className="px-2 pb-4">{children}</div>
      )}

      {note && !unavailable && (
        <div className="px-5 pb-4 border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground italic">{note}</p>
        </div>
      )}
    </div>
  );
}
