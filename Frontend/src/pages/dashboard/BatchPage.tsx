import { useState, useRef } from "react";
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { RiskBadge, PredictionBadge } from "@/components/data-display/Badges";
import { ErrorState } from "@/components/feedback/ErrorState";
import { KpiCard, KpiRow } from "@/components/data-display/KpiCard";

import { useBatchMutation } from "@/hooks/mutations/useMutations";
import { resolveDownloadUrl } from "@/api/client";
import type { BatchPredictionResponse } from "@/types/api";
import { formatPercent, formatFileSize } from "@/lib/utils";

const REQUIRED_COLUMNS = [
  "gender",
  "SeniorCitizen",
  "Partner",
  "Dependents",
  "tenure",
  "PhoneService",
  "MultipleLines",
  "InternetService",
  "OnlineSecurity",
  "OnlineBackup",
  "DeviceProtection",
  "TechSupport",
  "StreamingTV",
  "StreamingMovies",
  "Contract",
  "PaperlessBilling",
  "PaymentMethod",
  "MonthlyCharges",
  "TotalCharges",
];

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BatchPredictionResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const batchMutation = useBatchMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    batchMutation.mutate(file, {
      onSuccess: (data) => {
        setResult(data);
      },
    });
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!result?.download_url) return;
    const resolved = resolveDownloadUrl(result.download_url);
    window.open(resolved, "_blank");
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="Batch CSV Scoring"
        description="Upload customer datasets in bulk for concurrent inference, validation audit, and CSV export"
        icon={Upload}
      />

      {/* Upload Constraints & Specification Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground">File Requirements & Constraints</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground block mb-1">File Format</span>
            CSV UTF-8 encoding. Maximum file size: 10 MB (up to 5,000 rows).
          </div>
          <div>
            <span className="font-semibold text-foreground block mb-1">Optional Attributes</span>
            <code className="font-mono">customerID</code> (preserved as reference). Target <code className="font-mono">Churn</code> column is safely ignored.
          </div>
          <div>
            <span className="font-semibold text-foreground block mb-1">Required Features</span>
            All 19 feature columns must be present in the CSV header.
          </div>
        </div>
        <div className="border-t border-border/60 pt-3">
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            Columns: {REQUIRED_COLUMNS.join(", ")}
          </p>
        </div>
      </div>

      {/* Upload Drop Zone */}
      {!result && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {file ? file.name : "Choose a CSV file or drag and drop here"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {file ? `File size: ${formatFileSize(file.size)}` : "Standard comma-delimited .csv up to 10 MB"}
                </p>
              </div>
            </div>
          </div>

          {batchMutation.error && (
            <ErrorState error={batchMutation.error} title="Batch scoring failed" />
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || batchMutation.isPending}
              className="gap-2"
            >
              {batchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scoring In Bulk...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload and Process
                </>
              )}
            </Button>
            {file && (
              <Button variant="outline" onClick={handleReset} disabled={batchMutation.isPending}>
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Batch Completed ({result.batch_id.slice(0, 8)}...)
              </h3>
              <p className="text-xs text-muted-foreground">
                Total Rows: {result.total_rows} | Succeeded: {result.successful_rows} | Failed: {result.failed_rows}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {result.download_url && (
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" /> Download Scored CSV
                </Button>
              )}
              <Button variant="outline" onClick={handleReset}>
                Process Another File
              </Button>
            </div>
          </div>

          {/* Metric Summary */}
          <KpiRow>
            <KpiCard
              title="Processed Rows"
              value={result.total_rows.toLocaleString()}
              description="Total records ingested"
              icon={FileText}
            />
            <KpiCard
              title="Successfully Scored"
              value={result.successful_rows.toLocaleString()}
              description="Persisted to database"
              icon={CheckCircle}
              iconClassName="bg-green-500/10 text-green-600"
            />
            <KpiCard
              title="Row Validation Errors"
              value={result.failed_rows.toLocaleString()}
              description="Invalid row formatting"
              icon={XCircle}
              iconClassName={result.failed_rows > 0 ? "bg-rose-500/10 text-rose-600" : "bg-muted"}
            />
            <KpiCard
              title="Target Column Ignored"
              value={result.target_column_ignored ? "Yes" : "No"}
              description="Excluded from model predictors"
              icon={AlertTriangle}
            />
          </KpiRow>

          {/* Errors Table if any failed rows */}
          {result.errors.length > 0 && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-3">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Row-Level Validation Errors ({result.errors.length})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-destructive/10 text-destructive-foreground font-semibold">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Customer ID</th>
                      <th className="px-3 py-2">Error Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-destructive/10">
                    {result.errors.slice(0, 50).map((err, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 font-mono">{err.source_row}</td>
                        <td className="px-3 py-1.5 font-mono">{err.customerID ?? "—"}</td>
                        <td className="px-3 py-1.5 text-destructive">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Scored Results Preview Table */}
          {result.results.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-2">
              <div className="px-4 py-3 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">
                  Scored Records Preview (Showing first 20)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Row</th>
                      <th className="px-4 py-2.5">Customer ID</th>
                      <th className="px-4 py-2.5">Probability</th>
                      <th className="px-4 py-2.5">Risk Category</th>
                      <th className="px-4 py-2.5">Predicted Churn</th>
                      <th className="px-4 py-2.5">Model Version</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.results.slice(0, 20).map((r, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-2 font-mono">{r.source_row}</td>
                        <td className="px-4 py-2 font-mono font-medium">{r.customerID ?? "—"}</td>
                        <td className="px-4 py-2 font-semibold tabular-nums">
                          {formatPercent(r.churn_probability)}
                        </td>
                        <td className="px-4 py-2">
                          <RiskBadge category={r.risk_category} size="sm" />
                        </td>
                        <td className="px-4 py-2">
                          <PredictionBadge predicted={r.predicted_churn} />
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{r.model_version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
