import {
  GitCompare,
  Activity,
  Award,
  CheckCircle2,
  Info,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChartShell } from "@/components/charts/ChartShell";
import {
  CurveChart,
  ConfusionMatrixChart,
  FeatureImportanceChart,
} from "@/components/charts/DomainCharts";
import { ChartSkeleton } from "@/components/feedback/LoadingSkeletons";
import { KpiCard, KpiRow } from "@/components/data-display/KpiCard";
import { Badge } from "@/components/ui/badge";

import { useModelStatus, useModelMetrics, useModelComparison } from "@/hooks/queries/useModel";
import {
  useConfusionMatrix,
  useRocCurve,
  usePrecisionRecallCurve,
  useThresholdComparison,
  useFeatureImportance,
} from "@/hooks/queries/useAnalytics";
import { formatPercent, formatDateTime } from "@/lib/utils";

export default function ModelLabPage() {
  const statusQuery = useModelStatus();
  const metricsQuery = useModelMetrics();
  const comparisonQuery = useModelComparison();
  const cmQuery = useConfusionMatrix();
  const rocQuery = useRocCurve();
  const prQuery = usePrecisionRecallCurve();
  const thresholdQuery = useThresholdComparison();
  const importanceQuery = useFeatureImportance();

  const metrics = metricsQuery.data?.metrics;
  const status = statusQuery.data;

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="Model Lab & Evaluation Diagnostics"
        description="Candidate model benchmarks, holdout confusion matrix, ROC/PR curves, threshold tuning, and permutation feature importance"
        icon={GitCompare}
      />

      {/* Evaluation caveat disclaimer */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-foreground">Holdout evaluation split:</span> Performance diagnostics are calculated on an offline stratified test set. They provide model quality indicators and diagnostic tradeoffs, but do not represent a guaranteed production SLA.
        </p>
      </div>

      {/* Selected Model Performance Cards */}
      <KpiRow>
        <KpiCard
          title="Selected Classifier"
          value={status?.model_name ?? "Evaluating..."}
          description={`Version: ${status?.model_version ?? "v1.0.0"}`}
          icon={Award}
          note={`Trained: ${status?.trained_at ? formatDateTime(status.trained_at) : "Artifact loaded"}`}
        />
        <KpiCard
          title="Holdout ROC-AUC"
          value={metrics?.["roc_auc"] !== undefined ? metrics["roc_auc"].toFixed(4) : "—"}
          description="Discrimination capability across thresholds"
          icon={TrendingUp}
        />
        <KpiCard
          title="F1 Score"
          value={metrics?.["f1"] !== undefined ? metrics["f1"].toFixed(4) : "—"}
          description="Harmonic mean of precision and recall"
          icon={Activity}
        />
        <KpiCard
          title="Accuracy"
          value={metrics?.["accuracy"] !== undefined ? formatPercent(metrics["accuracy"]) : "—"}
          description="Overall correct classification rate"
          icon={CheckCircle2}
        />
      </KpiRow>

      {/* Candidate Model Comparison Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Candidate Model Benchmarking</h3>
            <p className="text-xs text-muted-foreground">
              Comparison across candidate algorithms evaluated during pipeline training
            </p>
          </div>
          {comparisonQuery.data?.selection_criterion && (
            <Badge variant="outline" className="text-xs">
              Selection Criterion: {comparisonQuery.data.selection_criterion}
            </Badge>
          )}
        </div>

        {comparisonQuery.isLoading ? (
          <div className="h-40 rounded-xl border border-border bg-card p-4 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Loading model benchmarks...</span>
          </div>
        ) : comparisonQuery.data?.data?.length ? (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Model Candidate</th>
                    <th className="px-4 py-3">ROC-AUC</th>
                    <th className="px-4 py-3">F1 Score</th>
                    <th className="px-4 py-3">Precision</th>
                    <th className="px-4 py-3">Recall</th>
                    <th className="px-4 py-3">Accuracy</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonQuery.data.data.map((row: any, i: number) => {
                    const isSelected = row.model_name === comparisonQuery.data?.selected_model;
                    return (
                      <tr key={i} className={isSelected ? "bg-primary/5 font-medium" : "hover:bg-muted/20"}>
                        <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                          {isSelected && <Award className="h-3.5 w-3.5 text-primary" />}
                          {row.model_name}
                        </td>
                        <td className="px-4 py-3 tabular-nums">{Number(row.roc_auc ?? 0).toFixed(4)}</td>
                        <td className="px-4 py-3 tabular-nums">{Number(row.f1 ?? 0).toFixed(4)}</td>
                        <td className="px-4 py-3 tabular-nums">{Number(row.precision ?? 0).toFixed(4)}</td>
                        <td className="px-4 py-3 tabular-nums">{Number(row.recall ?? 0).toFixed(4)}</td>
                        <td className="px-4 py-3 tabular-nums">{formatPercent(row.accuracy)}</td>
                        <td className="px-4 py-3 text-right">
                          {isSelected ? (
                            <Badge className="bg-primary text-white text-[10px]">Selected</Badge>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">Candidate</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* Diagnostic Curves and Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <ChartShell
          title="Holdout Confusion Matrix Heatmap"
          description="True positives, true negatives, false alarms, and missed churn cases"
          empty={!cmQuery.data}
        >
          {cmQuery.isLoading ? (
            <ChartSkeleton height={260} />
          ) : cmQuery.data ? (
            <ConfusionMatrixChart data={cmQuery.data} />
          ) : null}
        </ChartShell>

        {/* Global Permutation Feature Importance */}
        <ChartShell
          title="Global Permutation Feature Importance"
          description="Mean decrease in held-out ROC-AUC when input feature column is shuffled"
          unavailable={importanceQuery.data?.status === "unavailable"}
          unavailableReason={importanceQuery.data?.reason}
          empty={!importanceQuery.data?.data?.length && !importanceQuery.data?.features?.length}
          note="Global model sensitivity across population. Does not explain individual customer predictions."
        >
          {importanceQuery.isLoading ? (
            <ChartSkeleton height={260} />
          ) : (
            <FeatureImportanceChart
              data={
                (importanceQuery.data?.features as any) ??
                importanceQuery.data?.data ??
                []
              }
              height={260}
            />
          )}
        </ChartShell>

        {/* ROC Curve */}
        <ChartShell
          title="Receiver Operating Characteristic (ROC)"
          description="Trade-off between true positive rate and false positive rate"
          empty={!rocQuery.data?.data?.length}
        >
          {rocQuery.isLoading ? (
            <ChartSkeleton height={260} />
          ) : rocQuery.data ? (
            <CurveChart data={rocQuery.data} type="roc" height={260} />
          ) : null}
        </ChartShell>

        {/* Precision-Recall Curve */}
        <ChartShell
          title="Precision-Recall Curve"
          description="Performance trade-off under class imbalance"
          empty={!prQuery.data?.data?.length}
        >
          {prQuery.isLoading ? (
            <ChartSkeleton height={260} />
          ) : prQuery.data ? (
            <CurveChart data={prQuery.data} type="pr" height={260} />
          ) : null}
        </ChartShell>
      </div>

      {/* Threshold Comparison Diagnostics Table */}
      {thresholdQuery.data?.data?.length ? (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Threshold Operating Point Tradeoffs
            </h3>
            <p className="text-xs text-muted-foreground">
              {thresholdQuery.data.note ??
                "Examine how altering the decision threshold affects precision, recall, and false alert rates."}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">Threshold</th>
                  <th className="px-3 py-2">Precision</th>
                  <th className="px-3 py-2">Recall</th>
                  <th className="px-3 py-2">F1 Score</th>
                  <th className="px-3 py-2">Predicted Churners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {thresholdQuery.data.data.slice(0, 10).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-3 py-1.5 font-mono font-medium">{Number(row.threshold ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-1.5 tabular-nums">{Number(row.precision ?? 0).toFixed(4)}</td>
                    <td className="px-3 py-1.5 tabular-nums">{Number(row.recall ?? 0).toFixed(4)}</td>
                    <td className="px-3 py-1.5 tabular-nums">{Number(row.f1 ?? 0).toFixed(4)}</td>
                    <td className="px-3 py-1.5 tabular-nums">{row.predicted_churners ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
