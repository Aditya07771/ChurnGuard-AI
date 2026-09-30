import { useState } from "react";
import {
  Database,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/data-display/Pagination";
import { KpiCard, KpiRow } from "@/components/data-display/KpiCard";
import { TableSkeleton, KpiCardSkeleton } from "@/components/feedback/LoadingSkeletons";
import { ErrorState } from "@/components/feedback/ErrorState";

import {
  useDatasetSummary,
  useDatasetPreview,
  useDatasetProfile,
  useDatasetMissingValues,
} from "@/hooks/queries/useDataset";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function DatasetPage() {
  const [activeTab, setActiveTab] = useState<"preview" | "profile" | "missing">("preview");
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const limit = 20;

  const summaryQuery = useDatasetSummary();
  const profileQuery = useDatasetProfile();
  const missingQuery = useDatasetMissingValues();
  const previewQuery = useDatasetPreview({
    limit,
    offset,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const summary = summaryQuery.data;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setOffset(0);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Dataset Explorer"
        description="Dataset schema, target distribution, statistical profiles, and bounded record inspector"
        icon={Database}
      />

      {/* Dataset Summary KPIs */}
      {summaryQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
      ) : summaryQuery.error ? (
        <ErrorState error={summaryQuery.error} title="Failed to load dataset summary" />
      ) : summary ? (
        <KpiRow>
          <KpiCard
            title="Total Observations"
            value={formatNumber(summary.dimensions?.rows)}
            description="Kaggle Telco Customer snapshot rows"
            icon={FileSpreadsheet}
          />
          <KpiCard
            title="Feature Dimensions"
            value={formatNumber(summary.dimensions?.columns)}
            description="Account & demographic attributes"
            icon={Layers}
          />
          <KpiCard
            title="Target Churn Rate"
            value={formatPercent(summary.target_distribution?.churn_rate)}
            description={`${summary.target_distribution?.Yes ?? 0} churned / ${summary.target_distribution?.No ?? 0} retained`}
            icon={AlertCircle}
          />
          <KpiCard
            title="Integrity Fingerprint"
            value={
              <span className="font-mono text-xs block truncate" title={summary.fingerprint_sha256}>
                {summary.fingerprint_sha256 ? `${summary.fingerprint_sha256.slice(0, 10)}...` : "SHA-256 Valid"}
              </span>
            }
            description="Cryptographic dataset signature"
            icon={CheckCircle}
          />
        </KpiRow>
      ) : null}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "preview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Data Preview
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Statistical Profile
        </button>
        <button
          onClick={() => setActiveTab("missing")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "missing"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Data Hygiene & Nulls
        </button>
      </div>

      {/* Tab 1: Preview Table */}
      {activeTab === "preview" && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Click any column header to sort. Bounded preview avoids downloading entire CSV to browser.</span>
            {sortBy && (
              <span className="font-mono">
                Sorted by: {sortBy} ({sortOrder})
              </span>
            )}
          </div>

          {previewQuery.isLoading ? (
            <TableSkeleton rows={limit} cols={8} />
          ) : previewQuery.error ? (
            <ErrorState error={previewQuery.error} title="Failed to load preview data" />
          ) : previewQuery.data?.data?.length ? (
            <>
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-muted/70 sticky top-0 z-10 border-b border-border text-muted-foreground uppercase font-semibold">
                      <tr>
                        {Object.keys(previewQuery.data.data[0]).map((col) => (
                          <th
                            key={col}
                            onClick={() => handleSort(col)}
                            className="px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors"
                          >
                            <span className="inline-flex items-center gap-1">
                              {col}
                              {sortBy === col && (
                                <ArrowUpDown className="h-3 w-3 text-primary" />
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {previewQuery.data.data.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          {Object.entries(row).map(([col, val]) => (
                            <td key={col} className="px-3 py-2 font-mono">
                              {String(val ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Pagination
                total={previewQuery.data.pagination.total}
                limit={limit}
                offset={offset}
                onPageChange={(newOffset) => setOffset(newOffset)}
              />
            </>
          ) : null}
        </div>
      )}

      {/* Tab 2: Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in-50">
          {profileQuery.isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : profileQuery.data ? (
            <>
              {/* Numerical stats */}
              {profileQuery.data.numerical && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Numerical Features Summary
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2">Feature</th>
                          <th className="px-3 py-2">Mean</th>
                          <th className="px-3 py-2">Std Dev</th>
                          <th className="px-3 py-2">Min</th>
                          <th className="px-3 py-2">25%</th>
                          <th className="px-3 py-2">Median (50%)</th>
                          <th className="px-3 py-2">75%</th>
                          <th className="px-3 py-2">Max</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {Object.entries(profileQuery.data.numerical).map(([feat, stat]: any) => (
                          <tr key={feat} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-semibold text-foreground">{feat}</td>
                            <td className="px-3 py-2 tabular-nums">{Number(stat.mean ?? 0).toFixed(2)}</td>
                            <td className="px-3 py-2 tabular-nums">{Number(stat.std ?? 0).toFixed(2)}</td>
                            <td className="px-3 py-2 tabular-nums">{stat.min}</td>
                            <td className="px-3 py-2 tabular-nums">{Number(stat["25%"] ?? 0).toFixed(2)}</td>
                            <td className="px-3 py-2 tabular-nums">{Number(stat["50%"] ?? 0).toFixed(2)}</td>
                            <td className="px-3 py-2 tabular-nums">{Number(stat["75%"] ?? 0).toFixed(2)}</td>
                            <td className="px-3 py-2 tabular-nums">{stat.max}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Categorical stats */}
              {profileQuery.data.categorical && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Categorical Features Cardinality & Mode
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2">Feature</th>
                          <th className="px-3 py-2">Unique Values</th>
                          <th className="px-3 py-2">Most Frequent (Mode)</th>
                          <th className="px-3 py-2">Mode Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {Object.entries(profileQuery.data.categorical).map(([feat, stat]: any) => (
                          <tr key={feat} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-semibold text-foreground">{feat}</td>
                            <td className="px-3 py-2 tabular-nums">{stat.unique}</td>
                            <td className="px-3 py-2 font-mono">{stat.top}</td>
                            <td className="px-3 py-2 tabular-nums">{formatNumber(stat.freq)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Tab 3: Missing values & Hygiene */}
      {activeTab === "missing" && (
        <div className="space-y-4 animate-in fade-in-50">
          {missingQuery.isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : missingQuery.data?.columns?.length ? (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-3 p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Data Hygiene & Missing Value Analysis
              </h3>
              <p className="text-xs text-muted-foreground">
                Tracks missing null values before and after automated cleaning pipelines.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Column Name</th>
                      <th className="px-3 py-2">Missing (Raw)</th>
                      <th className="px-3 py-2">Raw %</th>
                      <th className="px-3 py-2">Missing (Cleaned)</th>
                      <th className="px-3 py-2">Clean %</th>
                      <th className="px-3 py-2">Treatment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {missingQuery.data.columns.map((c) => (
                      <tr key={c.column} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-semibold text-foreground">{c.column}</td>
                        <td className="px-3 py-2 tabular-nums">{c.missing_before}</td>
                        <td className="px-3 py-2 tabular-nums">{(c.percent_before * 100).toFixed(2)}%</td>
                        <td className="px-3 py-2 tabular-nums font-semibold text-green-600">
                          {c.missing_after}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-green-600">
                          {(c.percent_after * 100).toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {c.action ?? "No null imputation needed"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No missing value anomalies detected across features.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
