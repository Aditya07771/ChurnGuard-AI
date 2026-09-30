/**
 * Domain-specific chart components built on Recharts.
 * Each chart maps from actual API response shapes.
 */
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Legend, Cell, ScatterChart, Scatter, ZAxis,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import type {
  ChartResponse,
  CurveDataResponse,
  ConfusionMatrixResponse,
} from "@/types/api";

const CHART_COLORS = {
  primary: "#1D6044",
  teal: "#0F766E",
  violet: "#8A6A2F",
  amber: "#B45309",
  rose: "#BE123C",
  slate: "#6E6A61",
  indigo: "#1D6044",
};

const RISK_COLORS: Record<string, string> = {
  Low: "#15803D",
  Medium: "#B45309",
  High: "#BE123C",
};

// ──────────────────────────────────────────────
// Generic bar chart from ChartResponse
// ──────────────────────────────────────────────

interface GenericBarChartProps {
  chart: ChartResponse;
  height?: number;
  formatXTick?: (v: string) => string;
  formatYTick?: (v: number) => string;
  horizontal?: boolean;
}

export function GenericBarChart({
  chart,
  height = 260,
  formatXTick,
  formatYTick,
  horizontal = false,
}: GenericBarChartProps) {
  if (!chart.data.length) return null;
  const xKey = chart.x_key ?? "name";
  const seriesColors = [CHART_COLORS.primary, CHART_COLORS.teal, CHART_COLORS.violet, CHART_COLORS.amber];

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chart.data} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E9E2D7" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#6E6A61" }}
            tickFormatter={formatYTick ?? ((v) => `${(v * 100).toFixed(0)}%`)}
          />
          <YAxis
            type="category"
            dataKey={xKey}
            tick={{ fontSize: 11, fill: "#6E6A61" }}
            width={110}
            tickFormatter={formatXTick}
          />
          <Tooltip
            formatter={(value: any, name: any) => {
              const series = chart.series.find((s) => s.key === name);
              const num = Number(value ?? 0);
              return [formatYTick ? formatYTick(num) : `${(num * 100).toFixed(1)}%`, series?.label ?? name];
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          {chart.series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.key} fill={seriesColors[i % seriesColors.length]} radius={[0, 3, 3, 0]} maxBarSize={24} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chart.data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E2D7" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#6E6A61" }} tickFormatter={formatXTick} />
        <YAxis tick={{ fontSize: 11, fill: "#6E6A61" }} tickFormatter={formatYTick} width={48} />
        <Tooltip
          formatter={(value: any, name: any) => {
            const series = chart.series.find((s) => s.key === name);
            const num = Number(value ?? 0);
            return [formatYTick ? formatYTick(num) : num, series?.label ?? name];
          }}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {chart.series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.key} fill={seriesColors[i % seriesColors.length]} radius={[3, 3, 0, 0]} maxBarSize={40} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// Churn rate bar — with churn_rate as percent
// ──────────────────────────────────────────────

export function ChurnRateBar({ chart, height = 260 }: { chart: ChartResponse; height?: number }) {
  return (
    <GenericBarChart
      chart={chart}
      height={height}
      formatYTick={(v) => `${(v * 100).toFixed(0)}%`}
    />
  );
}

// ──────────────────────────────────────────────
// ROC / Precision-Recall curves
// ──────────────────────────────────────────────

interface CurveChartProps {
  data: CurveDataResponse;
  type: "roc" | "pr";
  height?: number;
}

export function CurveChart({ data, type, height = 260 }: CurveChartProps) {
  if (!data.data?.length) return null;

  const points = data.data.map((p) => ({ x: p.x, y: p.y }));

  const xLabel = type === "roc" ? "False Positive Rate" : "Recall";
  const yLabel = type === "roc" ? "True Positive Rate" : "Precision";
  const auc = data.auc;

  return (
    <div>
      {auc !== undefined && (
        <p className="text-xs text-muted-foreground mb-2 px-4">
          AUC = <span className="font-semibold tabular-nums">{auc.toFixed(4)}</span>
        </p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={points} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9E2D7" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 11, fill: "#6E6A61" }}
            label={{ value: xLabel, position: "insideBottom", offset: -12, fontSize: 11, fill: "#6E6A61" }}
          />
          <YAxis
            dataKey="y"
            domain={[0, 1]}
            tick={{ fontSize: 11, fill: "#6E6A61" }}
            label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 8, fontSize: 11, fill: "#6E6A61" }}
            width={48}
          />
          <Tooltip
            formatter={(value: any, name: any) => [Number(value ?? 0).toFixed(4), name === "y" ? yLabel : xLabel]}
            labelFormatter={(label) => `${xLabel}: ${Number(label).toFixed(4)}`}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          {type === "roc" && (
            <ReferenceLine
              segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
              stroke="#D8CFC0"
              strokeDasharray="4 4"
              label={{ value: "Random", position: "insideTopLeft", fontSize: 10, fill: "#8B8478" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="y"
            stroke={CHART_COLORS.primary}
            dot={false}
            strokeWidth={2}
            name={yLabel}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────────
// Confusion Matrix heatmap
// ──────────────────────────────────────────────

interface ConfusionMatrixChartProps {
  data: ConfusionMatrixResponse;
}

export function ConfusionMatrixChart({ data }: ConfusionMatrixChartProps) {
  // Try to get matrix from response — handle various shapes
  const matrix = data.matrix ??
    (data.data
      ? (() => {
          // Extract from data array if provided
          const m: number[][] = [[0, 0], [0, 0]];
          if (Array.isArray(data.data)) {
            const d = data.data as Array<{ actual?: string; predicted?: string; count?: number; TN?: number; FP?: number; FN?: number; TP?: number }>;
            for (const row of d) {
              if (row.TN !== undefined) m[0][0] = row.TN;
              if (row.FP !== undefined) m[0][1] = row.FP;
              if (row.FN !== undefined) m[1][0] = row.FN;
              if (row.TP !== undefined) m[1][1] = row.TP;
            }
          }
          return m;
        })()
      : null);

  const counts = data.counts;
  const tn = counts?.TN ?? matrix?.[0]?.[0] ?? 0;
  const fp = counts?.FP ?? matrix?.[0]?.[1] ?? 0;
  const fn = counts?.FN ?? matrix?.[1]?.[0] ?? 0;
  const tp = counts?.TP ?? matrix?.[1]?.[1] ?? 0;
  const total = tn + fp + fn + tp;

  const cells = [
    { label: "True Negative", abbr: "TN", value: tn, desc: "Correctly predicted: No churn", bg: "bg-green-50", border: "border-green-200", text: "text-green-800" },
    { label: "False Positive", abbr: "FP", value: fp, desc: "Incorrectly predicted: Will churn", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
    { label: "False Negative", abbr: "FN", value: fn, desc: "Missed churn cases", bg: "bg-red-50", border: "border-red-200", text: "text-red-800" },
    { label: "True Positive", abbr: "TP", value: tp, desc: "Correctly predicted: Will churn", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800" },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 text-center">
        <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground mb-1">
          <div />
          <div className="text-center font-medium col-span-1">Predicted: No</div>
          <div className="text-center font-medium" style={{ gridColumnStart: 3 }}>Predicted: Yes</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col justify-around text-xs text-muted-foreground font-medium py-2 w-16 shrink-0">
          <span className="text-center">Actual: No</span>
          <span className="text-center">Actual: Yes</span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {cells.map((cell) => (
            <div
              key={cell.abbr}
              className={cn(
                "rounded-lg border p-4 text-center space-y-1",
                cell.bg,
                cell.border,
              )}
            >
              <div className={cn("text-2xl font-bold tabular-nums", cell.text)}>
                {cell.value.toLocaleString()}
              </div>
              <div className={cn("text-xs font-semibold", cell.text)}>{cell.abbr}</div>
              <div className="text-xs text-muted-foreground">{cell.label}</div>
              {total > 0 && (
                <div className="text-xs text-muted-foreground tabular-nums">
                  {((cell.value / total) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Holdout evaluation split — {total.toLocaleString()} samples
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────
// Feature importance horizontal bar chart
// ──────────────────────────────────────────────

interface ImportanceData {
  feature: string;
  importance: number;
}

export function FeatureImportanceChart({ data, height }: { data: ImportanceData[]; height?: number }) {
  const sorted = [...data].sort((a, b) => b.importance - a.importance).slice(0, 15);
  const barHeight = Math.max((height ?? 300), sorted.length * 24 + 40);

  return (
    <ResponsiveContainer width="100%" height={barHeight}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E9E2D7" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#6E6A61" }} tickFormatter={(v) => v.toFixed(3)} />
        <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: "#6E6A61" }} width={140} />
        <Tooltip
          formatter={(v: any) => [Number(v ?? 0).toFixed(4), "Importance (ROC-AUC drop)"]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="importance" fill={CHART_COLORS.primary} radius={[0, 3, 3, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// Risk distribution bar (from active customer data)
// ──────────────────────────────────────────────

export function RiskDistributionBars({ data }: { data: Record<string, unknown>[] }) {
  const colored = data.map((row) => ({
    ...row,
    fill: RISK_COLORS[String(row.risk_category ?? row.name ?? "")] ?? CHART_COLORS.slate,
  }));

  const xKey = "risk_category";

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={colored} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E2D7" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#6E6A61" }} />
        <YAxis tick={{ fontSize: 11, fill: "#6E6A61" }} width={48} />
        <Tooltip
          formatter={(v: any) => [Number(v ?? 0).toLocaleString(), "Customers"]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={60}>
          {colored.map((entry, i) => (
            <Cell key={i} fill={entry.fill as string} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// Risk landscape scatter (tenure vs monthly charges)
// ──────────────────────────────────────────────

interface ScatterPoint {
  x: number; // tenure
  y: number; // MonthlyCharges
  risk?: string;
  probability?: number;
  customerId?: string;
}

export function RiskLandscapeScatter({ points, height = 320 }: { points: ScatterPoint[]; height?: number }) {
  const coloredPoints = points.map((p) => ({
    ...p,
    fill: RISK_COLORS[p.risk ?? ""] ?? CHART_COLORS.slate,
  }));

  // Group by risk for legend
  const byRisk: Record<string, typeof coloredPoints> = {};
  for (const p of coloredPoints) {
    const r = p.risk ?? "Unknown";
    if (!byRisk[r]) byRisk[r] = [];
    byRisk[r].push(p);
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 20, bottom: 24, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E9E2D7" />
        <XAxis
          type="number"
          dataKey="x"
          domain={[0, 75]}
          tick={{ fontSize: 11, fill: "#6E6A61" }}
          label={{ value: "Tenure (months)", position: "insideBottom", offset: -12, fontSize: 11, fill: "#6E6A61" }}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={[0, 120]}
          tick={{ fontSize: 11, fill: "#6E6A61" }}
          label={{ value: "Monthly Charges ($)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "#6E6A61" }}
          width={56}
        />
        <ZAxis range={[20, 20]} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as ScatterPoint;
            return (
              <div className="bg-card border border-border rounded-lg p-3 shadow-md text-xs space-y-1">
                {d.customerId && <p className="font-medium">{d.customerId}</p>}
                <p>Tenure: <span className="tabular-nums">{d.x} months</span></p>
                <p>Monthly Charges: <span className="tabular-nums">${d.y.toFixed(2)}</span></p>
                {d.probability !== undefined && (
                  <p>Churn probability: <span className="tabular-nums">{(d.probability * 100).toFixed(1)}%</span></p>
                )}
                {d.risk && <p>Risk: <span className="font-medium">{d.risk}</span></p>}
              </div>
            );
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {Object.entries(byRisk).map(([risk, pts]) => (
          <Scatter
            key={risk}
            data={pts}
            fill={RISK_COLORS[risk] ?? CHART_COLORS.slate}
            opacity={0.7}
            name={`${risk} risk`}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// Explanation waterfall / diverging bars
// ──────────────────────────────────────────────

interface ExplFeature {
  feature: string;
  contribution: number;
  direction: string;
  value?: unknown;
}

export function ExplanationBars({ features, height }: { features: ExplFeature[]; height?: number }) {
  const top = [...features]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 10)
    .map((f) => ({
      ...f,
      display: f.feature.replace(/([A-Z])/g, " $1").trim(),
      abs: Math.abs(f.contribution),
      signed: f.contribution,
    }));

  const barH = Math.max(height ?? 280, top.length * 28 + 60);

  return (
    <ResponsiveContainer width="100%" height={barH}>
      <BarChart data={top} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E9E2D7" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#6E6A61" }}
          tickFormatter={(v) => v.toFixed(3)}
        />
        <YAxis type="category" dataKey="display" tick={{ fontSize: 10, fill: "#6E6A61" }} width={140} />
        <ReferenceLine x={0} stroke="#8B8478" />
        <Tooltip
          formatter={(v: any) => [Number(v ?? 0).toFixed(4), "Contribution"]}
          labelFormatter={(label) => `Feature: ${label}`}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="signed" name="Contribution" radius={[0, 3, 3, 0]} maxBarSize={18}>
          {top.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.direction === "increases" ? "#BE123C" : entry.direction === "decreases" ? "#15803D" : "#64748B"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
