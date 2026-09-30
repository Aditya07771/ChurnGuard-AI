import { useState } from "react";
import { Link } from "react-router-dom";
import {
  History,
  Eye,
  X,
  Brain,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/data-display/Pagination";
import { RiskBadge, PredictionBadge } from "@/components/data-display/Badges";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableSkeleton } from "@/components/feedback/LoadingSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

import {
  usePredictionHistory,
  usePredictionDetail,
} from "@/hooks/queries/usePredictionHistory";
import type { RiskCategory, HistoryFilters } from "@/types/api";
import { formatPercent, formatDateTime } from "@/lib/utils";

export default function HistoryPage() {
  const [riskCategory, setRiskCategory] = useState<RiskCategory | "">("");
  const [offset, setOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const limit = 20;

  const filters: HistoryFilters = {
    limit,
    offset,
    risk_category: riskCategory || undefined,
  };

  const { data, isLoading, error, refetch } = usePredictionHistory(filters);
  const { data: detailData, isLoading: detailLoading } = usePredictionDetail(
    selectedId ?? 0,
    selectedId !== null
  );

  const handleRiskChange = (val: RiskCategory | "") => {
    setRiskCategory(val);
    setOffset(0);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Prediction History"
        description="Audit log of historical inference queries, prediction outputs, and serialized input payloads"
        icon={History}
      />

      {/* Filter tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs">
          <button
            onClick={() => handleRiskChange("")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              riskCategory === ""
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Bands
          </button>
          <button
            onClick={() => handleRiskChange("High")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              riskCategory === "High"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            High Risk
          </button>
          <button
            onClick={() => handleRiskChange("Medium")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              riskCategory === "Medium"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Medium Risk
          </button>
          <button
            onClick={() => handleRiskChange("Low")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              riskCategory === "Low"
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Low Risk
          </button>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link to="/dashboard/predict">
            <Brain className="h-3.5 w-3.5 mr-1" /> New Prediction
          </Link>
        </Button>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton rows={limit} cols={7} />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Failed to load prediction history"
        />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={History}
          title={riskCategory ? `No ${riskCategory} risk predictions found` : "No predictions recorded"}
          description="Inference logs will populate automatically whenever single or batch predictions are generated."
          action={
            <Button asChild size="sm">
              <Link to="/dashboard/predict">Run Prediction Now</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Audit ID</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Customer ID</th>
                    <th className="px-4 py-3">Predicted Risk</th>
                    <th className="px-4 py-3">Probability</th>
                    <th className="px-4 py-3">Binary Class</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        #{record.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(record.created_at)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {record.customer_id ?? "Direct Form"}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge category={record.risk_category} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                        {formatPercent(record.churn_probability)}
                      </td>
                      <td className="px-4 py-3">
                        <PredictionBadge predicted={record.predicted_churn} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {record.model_version ?? "v1.0.0"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedId(record.id)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            total={data.pagination.total}
            limit={limit}
            offset={offset}
            onPageChange={(newOffset) => setOffset(newOffset)}
          />
        </div>
      )}

      {/* Detail Modal / Drawer for Snapshot */}
      {selectedId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-20">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Prediction Audit Record #{selectedId}
                </h3>
                {detailData && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Logged {formatDateTime(detailData.created_at)}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedId(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {detailLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading record details...</div>
              ) : detailData ? (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Probability</span>
                      <span className="text-lg font-bold tabular-nums">
                        {formatPercent(detailData.churn_probability)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Risk Band</span>
                      <div className="mt-1">
                        <RiskBadge category={detailData.risk_category} size="sm" />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Predicted Class</span>
                      <div className="mt-1">
                        <PredictionBadge predicted={detailData.predicted_churn} />
                      </div>
                    </div>
                  </div>

                  {/* Input Snapshot */}
                  {detailData.input_snapshot ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                        Saved Input Feature Snapshot
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/20 border border-border rounded-xl">
                        {Object.entries(detailData.input_snapshot).map(([key, val]) => (
                          <div key={key}>
                            <dt className="text-muted-foreground text-[10px] uppercase">{key}</dt>
                            <dd className="font-medium text-foreground mt-0.5 truncate">
                              {String(val ?? "null")}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No input snapshot preserved for this record.</p>
                  )}
                </>
              ) : null}
            </div>

            <div className="px-6 py-3 border-t border-border bg-muted/30 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
