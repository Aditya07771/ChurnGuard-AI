import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useHealth } from "@/hooks/queries/useHealth";
import { StatusDot } from "@/components/data-display/Badges";
import {
  LayoutDashboard,
  Users,
  Brain,
  FlaskConical,
  Upload,
  History,
  BarChart3,
  Database,
  GitCompare,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Risk Explorer", href: "/dashboard/customers", icon: Users },
    ],
  },
  {
    label: "Prediction Studio",
    items: [
      { label: "New Prediction", href: "/dashboard/predict", icon: Brain },
      { label: "What-if Lab", href: "/dashboard/scenarios", icon: FlaskConical },
      { label: "Batch Scoring", href: "/dashboard/batch", icon: Upload },
      { label: "Prediction History", href: "/dashboard/history", icon: History },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Model Lab", href: "/dashboard/model-lab", icon: GitCompare },
      { label: "Dataset Explorer", href: "/dashboard/dataset", icon: Database },
    ],
  },
  {
    label: "System",
    items: [
      { label: "API & Model Status", href: "/dashboard/system", icon: Activity },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

function SidebarContent({ collapsed, onToggle, mobile = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { data: health } = useHealth({ refetchInterval: 60_000 });
  const apiStatus = health?.status ?? "offline";

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className={cn(
        "flex items-center border-b border-sidebar-border",
        collapsed && !mobile ? "justify-center px-3 py-4" : "justify-between px-4 py-4"
      )}>
        <a
  href="/"
  aria-label="Go to ChurnGuard home"
  className={cn(
    "flex items-center gap-2.5 no-underline",
    collapsed && !mobile && "hidden"
  )}
>
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
    <Shield className="h-4 w-4 text-white" />
  </div>

  <div className="leading-none">
    <p className="text-sm font-bold text-sidebar-foreground">
      ChurnGuard
    </p>
    <p className="text-[10px] text-sidebar-muted">
      AI Analytics
    </p>
  </div>
</a>
        {collapsed && !mobile && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-white" />
          </div>
        )}
        {mobile ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 p-0 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "hidden"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6" aria-label="Dashboard navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed || mobile ? (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
                {group.label}
              </p>
            ) : (
              <div className="border-t border-sidebar-border mb-2" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== "/dashboard/overview" && location.pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        collapsed && !mobile && "justify-center px-2",
                      )}
                      onClick={mobile ? onClose : undefined}
                      title={collapsed && !mobile ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                      {(!collapsed || mobile) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Status footer */}
      <div className={cn(
        "border-t border-sidebar-border p-3",
        collapsed && !mobile && "flex justify-center"
      )}>
        {!collapsed || mobile ? (
          <div className="px-2">
            <StatusDot
              status={apiStatus as "ok" | "degraded" | "offline"}
              label={
                apiStatus === "ok"
                  ? "API & model ready"
                  : apiStatus === "degraded"
                  ? "System degraded"
                  : "Backend offline"
              }
              className="text-sidebar-muted"
            />
          </div>
        ) : (
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              apiStatus === "ok" ? "bg-green-500" : apiStatus === "degraded" ? "bg-amber-500" : "bg-red-500"
            )}
            title={`API status: ${apiStatus}`}
          />
        )}
      </div>

      {/* Collapse toggle on collapsed state */}
      {collapsed && !mobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="m-2 h-8 w-8 p-0 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Sidebar"
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar flex flex-col shadow-2xl">
        <SidebarContent collapsed={false} onToggle={onClose} mobile onClose={onClose} />
      </div>
    </div>
  );
}
