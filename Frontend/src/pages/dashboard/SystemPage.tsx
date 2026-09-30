import {
  Activity,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Code2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiRow } from "@/components/data-display/KpiCard";
import { StatusDot } from "@/components/data-display/Badges";

import { useHealth, useMetadata } from "@/hooks/queries/useHealth";
import { useModelStatus } from "@/hooks/queries/useModel";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { API_BASE } from "@/api/client";

export default function SystemPage() {
  const { data: health, refetch: refetchHealth } = useHealth({ refetchInterval: 30_000 });
  const { data: meta, refetch: refetchMeta } = useMetadata();
  const { data: modelStatus, refetch: refetchModel } = useModelStatus();

  const handleRefreshAll = () => {
    void refetchHealth();
    void refetchMeta();
    void refetchModel();
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        title="System Status & Architecture Readiness"
        description="FastAPI service readiness, static dataset integrity, model artifact registry, and environment configurations"
        icon={Activity}
        actions={
          <Button variant="outline" size="sm" onClick={handleRefreshAll} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Check Diagnostics
          </Button>
        }
      />

      {/* Service Health Summary Cards */}
      <KpiRow>
        <KpiCard
          title="FastAPI Backend Core"
          value={health?.api === "ready" ? "Operational" : "Offline"}
          description={`Base URL: ${API_BASE}`}
          icon={Server}
          iconClassName={health?.api === "ready" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
        />
        <KpiCard
          title="Dataset Ingestion"
          value={health?.dataset?.available ? "Available" : "Unavailable"}
          description={
            health?.dataset?.row_count
              ? `${formatNumber(health.dataset.row_count)} records verified`
              : "No raw data cached"
          }
          icon={Database}
          iconClassName={health?.dataset?.available ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
        />
        <KpiCard
          title="Trained Model Registry"
          value={health?.model?.available ? "Loaded" : "Offline"}
          description={health?.model?.model_name ?? "No classifier artifact"}
          icon={Cpu}
          iconClassName={health?.model?.available ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}
        />
        <KpiCard
          title="SQLite Database"
          value={health?.database === "initialized" ? "Active" : "Unreachable"}
          description="Local prediction audit store"
          icon={CheckCircle2}
        />
      </KpiRow>

      {/* Application & Environment Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground">Application Metadata</h3>
            {meta?.application?.environment && (
              <Badge variant="outline" className="text-xs">
                {meta.application.environment}
              </Badge>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted-foreground">App Name</dt>
              <dd className="font-semibold text-foreground mt-0.5">{meta?.application?.name ?? "ChurnGuard AI"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd className="font-semibold text-foreground mt-0.5">{meta?.application?.version ?? "v1.0.0"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Configured API Base</dt>
              <dd className="font-mono text-foreground mt-0.5 break-all">{API_BASE}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Default Frontend Origin</dt>
              <dd className="font-mono text-muted-foreground mt-0.5">http://localhost:5173</dd>
            </div>
          </dl>
        </div>

        {/* Model Artifact Details */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground">Model Artifact Metadata</h3>
            <StatusDot
              status={modelStatus?.available ? "ok" : "offline"}
              label={modelStatus?.available ? "Artifact Active" : "No Artifact"}
            />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted-foreground">Architecture</dt>
              <dd className="font-semibold text-foreground mt-0.5">{modelStatus?.model_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Model Version</dt>
              <dd className="font-semibold text-foreground mt-0.5">{modelStatus?.model_version ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Training Rows</dt>
              <dd className="font-semibold text-foreground mt-0.5">
                {formatNumber(meta?.model?.training_row_count)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Holdout Test Rows</dt>
              <dd className="font-semibold text-foreground mt-0.5">
                {formatNumber(meta?.model?.test_row_count)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Trained Timestamp</dt>
              <dd className="font-semibold text-foreground mt-0.5">
                {formatDateTime(modelStatus?.trained_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Dataset Fingerprint Audit */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Dataset Cryptographic Fingerprint</h3>
        <p className="text-xs text-muted-foreground">
          Guarantees that frontend analytics and backend predictions evaluate the identical immutable raw dataset snapshot.
        </p>
        <div className="rounded-lg bg-muted/40 p-3 font-mono text-xs space-y-1">
          <div><span className="text-muted-foreground">File:</span> {meta?.dataset?.filename ?? "WA_Fn-UseC_-Telco-Customer-Churn.csv"}</div>
          <div><span className="text-muted-foreground">SHA-256:</span> {meta?.dataset?.fingerprint_sha256 ?? "Not computed"}</div>
          <div><span className="text-muted-foreground">Loaded:</span> {formatDateTime(meta?.dataset?.loaded_at)}</div>
        </div>
      </div>

      {/* Backend CLI Training Notice */}
      <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Model Pipeline Administration</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In alignment with data governance best practices, model retraining is executed via the backend CLI to prevent accidental production model corruption from the UI:
        </p>
        <pre className="p-3 rounded-lg bg-sidebar text-sidebar-foreground font-mono text-xs overflow-x-auto">
          python -m app.ml.train
        </pre>
      </div>
    </div>
  );
}
