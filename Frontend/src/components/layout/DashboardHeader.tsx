import { useLocation } from "react-router-dom";
import { Menu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useHealth } from "@/hooks/queries/useHealth";
import { StatusDot } from "@/components/data-display/Badges";
import { cn } from "@/lib/utils";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard/overview": "Overview",
  "/dashboard/customers": "Risk Explorer",
  "/dashboard/predict": "New Prediction",
  "/dashboard/scenarios": "What-if Lab",
  "/dashboard/batch": "Batch Scoring",
  "/dashboard/history": "Prediction History",
  "/dashboard/analytics": "Analytics",
  "/dashboard/model-lab": "Model Lab",
  "/dashboard/dataset": "Dataset Explorer",
  "/dashboard/system": "System Status",
};

function getTitle(pathname: string): string {
  // Exact match
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // Customer detail
  if (pathname.startsWith("/dashboard/customers/")) return "Customer Detail";
  return "Dashboard";
}

interface DashboardHeaderProps {
  onMobileMenuOpen: () => void;
  sidebarCollapsed: boolean;
}

export function DashboardHeader({ onMobileMenuOpen }: DashboardHeaderProps) {
  const location = useLocation();
  const qc = useQueryClient();
  const { data: health, isFetching } = useHealth({ refetchInterval: 60_000 });
  const title = getTitle(location.pathname);

  const handleRefresh = () => {
    void qc.invalidateQueries();
  };

  return (
    <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border flex items-center gap-3 px-4 sm:px-6 py-3 shrink-0">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMobileMenuOpen}
        className="lg:hidden h-8 w-8 p-0"
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Backend status */}
        <div className="hidden sm:block">
          <StatusDot
            status={(health?.status ?? "offline") as "ok" | "degraded" | "offline"}
            label={
              health?.status === "ok"
                ? "Connected"
                : health?.status === "degraded"
                ? "Degraded"
                : "Offline"
            }
            className="text-muted-foreground text-xs"
          />
        </div>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="h-8 w-8 p-0"
          aria-label="Refresh data"
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
      </div>
    </header>
  );
}
