import { Link } from "react-router-dom";
import {
  Users,
  TrendingDown,
  Target,
  AlertTriangle,
  LayoutDashboard,
  DollarSign,
  Percent,
  Cpu,
  BookmarkCheck,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard, KpiRow } from "@/components/data-display/KpiCard";
import { RiskBadge, PredictionBadge } from "@/components/data-display/Badges";
import { ChartShell } from "@/components/charts/ChartShell";
import {
  ChurnRateBar,
  GenericBarChart,
  RiskDistributionBars,
  RiskLandscapeScatter,
} from "@/components/charts/DomainCharts";
import { ErrorState } from "@/components/feedback/ErrorState";
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/feedback/LoadingSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

import { useOverview } from "@/hooks/queries/useHealth";
import {
  useChurnByContract,
  useChurnByTenure,
  useCustomerDistribution,
  useRiskDistribution,
} from "@/hooks/queries/useAnalytics";
import { usePredictionHistory } from "@/hooks/queries/usePredictionHistory";
import { useCustomers } from "@/hooks/queries/useCustomers";

import {
  formatPercent,
  formatCurrency,
  formatNumber,
  formatDateTime,
} from "@/lib/utils";

export default function OverviewPage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useOverview({ refetchInterval: 60_000 });
  const { data: contractChart, isLoading: contractLoading } = useChurnByContract();
  const { data: tenureChart, isLoading: tenureLoading } = useChurnByTenure();
  const { data: customerDist, isLoading: distLoading } = useCustomerDistribution();
  const { data: riskDist, isLoading: riskDistLoading } = useRiskDistribution();
  const { data: history, isLoading: historyLoading } = usePredictionHistory({ limit: 10 });
  const { data: sampleCustomers, isLoading: customersLoading } = useCustomers({
    limit: 100,
    sort_by: "churn_probability",
    sort_order: "desc",
  });

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Executive Overview"
          description="High-level retention intelligence and model inference summaries"
          icon={LayoutDashboard}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={260} />
          <ChartSkeleton height={260} />
        </div>
      </div>
    );
  }

  if (overviewError || !overview) {
    return (
      <div className="py-12">
        <ErrorState
          error={overviewError}
          onRetry={() => void refetchOverview()}
          title="Failed to load Overview data"
        />
      </div>
    );
  }

  const hist = overview.historical;
  const active = overview.active_customer_risk;
  const model = overview.model;

  // Scatter points from real active customers
  const scatterPoints = (sampleCustomers?.data ?? []).map((c) => ({
    x: c.tenure,
    y: c.MonthlyCharges,
    risk: c.risk_category ?? "Unknown",
    probability: c.churn_probability,
    customerId: c.customerID,
  }));

  const churnDistChart = customerDist?.charts?.Churn;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Executive Overview"
        description="High-level retention intelligence, model inference summaries, and customer risk landscape"
        icon={LayoutDashboard}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Data generated: {formatDateTime(overview.generated_at)}
            </span>
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/predict">
                New Prediction
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* Row 1 Primary KPI Cards */}
      <KpiRow>
        <KpiCard
          title="Total Customers (Historical)"
          value={formatNumber(hist.total_customers)}
          description={`${formatNumber(hist.retained_customers)} retained, ${formatNumber(hist.churned_customers)} churned`}
          icon={Users}
          note="Actual historical records"
        />
        <KpiCard
          title="Historical Churn Rate"
          value={formatPercent(hist.actual_churn_rate)}
          description="Baseline attrition across snapshot"
          icon={TrendingDown}
          iconClassName="bg-rose-500/10 text-rose-600"
          note="Static dataset target outcome"
        />
        <KpiCard
          title="Eligible Scored Customers"
          value={
            active.eligible_customer_count !== null
              ? formatNumber(active.eligible_customer_count)
              : "—"
          }
          description="Retained accounts analyzed by model"
          icon={Target}
          iconClassName="bg-primary/10"
          note="Historical Churn = No candidates"
        />
        <KpiCard
          title="High-Risk Customers"
          value={
            active.risk_counts.High !== null
              ? formatNumber(active.risk_counts.High)
              : "—"
          }
          description={
            active.risk_percentages.High !== null
              ? `${active.risk_percentages.High?.toFixed(1)}% of eligible population`
              : "Model inference"
          }
          icon={AlertTriangle}
          iconClassName="bg-rose-500/10 text-rose-600"
          note="Threshold configured in model"
        />
      </KpiRow>

      {/* Row 2 Secondary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Mean Predicted Churn Risk"
          value={formatPercent(active.average_predicted_probability)}
          description="Average probability among eligible"
          icon={Percent}
        />
        <KpiCard
          title="Risk-Weighted Monthly Charges"
          value={formatCurrency(active.risk_weighted_monthly_charges_estimate)}
          description="Prioritization sum(prob × charge)"
          icon={DollarSign}
          note={active.financial_metric_note}
        />
        <KpiCard
          title="Active Model"
          value={model.model_name ?? "Unavailable"}
          description={model.model_version ? `Version: ${model.model_version}` : "No model loaded"}
          icon={Cpu}
          note={model.available ? "Ready for inference" : "Offline"}
        />
        <KpiCard
          title="Saved Predictions"
          value={formatNumber(overview.prediction_history.saved_predictions)}
          description="Inference audit log entries"
          icon={BookmarkCheck}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn by Contract */}
        <ChartShell
          title="Historical Churn by Contract"
          description="Attrition rates across contract terms from Kaggle dataset"
          empty={!contractChart?.data?.length}
        >
          {contractLoading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading chart...</span>
            </div>
          ) : contractChart ? (
            <ChurnRateBar chart={contractChart} height={260} />
          ) : null}
        </ChartShell>

        {/* Churn by Tenure */}
        <ChartShell
          title="Historical Churn by Tenure Band"
          description="Attrition segmented by customer account longevity"
          empty={!tenureChart?.data?.length}
        >
          {tenureLoading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading chart...</span>
            </div>
          ) : tenureChart ? (
            <ChurnRateBar chart={tenureChart} height={260} />
          ) : null}
        </ChartShell>

        {/* Active Risk Distribution */}
        <ChartShell
          title="Active Customer Risk Distribution"
          description="Current distribution of Low, Medium, and High risk classifications"
          unavailable={riskDist?.status === "unavailable"}
          unavailableReason={riskDist?.reason}
          empty={!riskDist?.data?.length}
        >
          {riskDistLoading ? (
            <div className="h-48 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading distribution...</span>
            </div>
          ) : riskDist?.data ? (
            <RiskDistributionBars data={riskDist.data} />
          ) : null}
        </ChartShell>

        {/* Customer Distribution Churn Target */}
        <ChartShell
          title="Historical Retention Mix"
          description="Overall dataset split between churned and retained customers"
          empty={!churnDistChart?.data?.length}
        >
          {distLoading ? (
            <div className="h-48 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading breakdown...</span>
            </div>
          ) : churnDistChart ? (
            <GenericBarChart chart={churnDistChart} height={200} />
          ) : null}
        </ChartShell>
      </div>

      {/* Customer Risk Landscape Scatter Plot */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Customer Risk Landscape</h2>
            <p className="text-xs text-muted-foreground">
              Tenure versus Monthly Charges for top eligible customers, colored by predicted risk band. (Not a geographic map).
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/customers">View All in Risk Explorer</Link>
          </Button>
        </div>

        <ChartShell
          title="Risk Landscape (100 Sample Records)"
          description="Tenure (X) vs Monthly Charges (Y) from active scored customers"
          empty={scatterPoints.length === 0}
          note="Actual customer records from the current page of the risk explorer. Highlights high-charge, low-tenure vulnerable clusters."
        >
          {customersLoading ? (
            <div className="h-80 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading customer landscape...</span>
            </div>
          ) : (
            <RiskLandscapeScatter points={scatterPoints} height={320} />
          )}
        </ChartShell>
      </div>

      {/* Recent Predictions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent Prediction Audits</h2>
            <p className="text-xs text-muted-foreground">
              Latest inference requests recorded in backend database
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/history" className="gap-1">
              Full History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {historyLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : !history?.data?.length ? (
          <EmptyState
            title="No predictions recorded yet"
            description="Use the Prediction Studio or Batch Scoring to generate live inferences."
            action={
              <Button asChild size="sm">
                <Link to="/dashboard/predict">Run First Prediction</Link>
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Customer Ref</th>
                    <th className="px-4 py-3">Probability</th>
                    <th className="px-4 py-3">Risk Band</th>
                    <th className="px-4 py-3">Prediction</th>
                    <th className="px-4 py-3">Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.data.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-xs">
                        {item.customer_id ?? "Direct API"}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {formatPercent(item.churn_probability)}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge category={item.risk_category} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <PredictionBadge predicted={item.predicted_churn} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {item.model_version ?? "v1.0.0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
