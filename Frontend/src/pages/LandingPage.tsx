import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, ArrowRight, ChevronRight, Database, GitCompare, Brain, FlaskConical,
  CheckCircle2, AlertCircle, Loader2, Menu, X, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealth, useMetadata, useOverview } from "@/hooks/queries/useHealth";
import { cn, formatNumber, formatPercent } from "@/lib/utils";

// ── Content constants (product copy, not fabricated data) ───────────────────

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Explainable ML", href: "#explainability" },
];

const CAPABILITIES = [
  {
    icon: Search,
    stat: "20",
    statLabel: "features profiled",
    title: "Explore the data",
    desc: "Inspect dataset dimensions, historical churn distributions, missing values, and statistical profiles for all 20 features.",
    tag: "dataset / features",
  },
  {
    icon: GitCompare,
    stat: "5",
    statLabel: "held-out metrics",
    title: "Compare the models",
    desc: "Evaluate candidate models using held-out metrics, ROC and precision-recall curves, confusion matrices, and feature permutation importance.",
    tag: "model / evaluation",
  },
  {
    icon: Brain,
    stat: "0–1",
    statLabel: "probability scale",
    title: "Explain predictions",
    desc: "Understand which customer features pushed an individual churn probability up or down compared with a baseline.",
    tag: "model / explainability",
  },
];

const WORKFLOW_STEPS = [
  {
    num: "01",
    icon: Database,
    title: "Inspect historical data",
    desc: "Explore the Telco customer dataset, target distribution, missing values, dimensions, and feature statistics.",
  },
  {
    num: "02",
    icon: GitCompare,
    title: "Compare ML models",
    desc: "Evaluate candidate models on a held-out test split using accuracy, precision, recall, F1, and ROC-AUC.",
  },
  {
    num: "03",
    icon: Brain,
    title: "Score and explain a customer",
    desc: "Submit a customer profile to obtain a churn probability, risk category, and feature-level explanations from the trained model.",
  },
  {
    num: "04",
    icon: FlaskConical,
    title: "Explore scenarios and export",
    desc: "Change customer attributes for what-if analysis, upload CSV files for batch scoring, and download results.",
  },
];

const EXPLAINABILITY = [
  {
    term: "Churn probability",
    desc: "A continuous score from 0–1 returned by the trained model for each customer profile.",
  },
  {
    term: "Binary prediction",
    desc: "Whether the model predicts churn according to a configurable threshold, defaulting to 0.5.",
  },
  {
    term: "Risk category",
    desc: "Low, Medium, and High probability bands configured by backend thresholds.",
  },
  {
    term: "Feature contribution",
    desc: "How much an individual feature shifted the probability relative to a baseline. This is not a causal explanation.",
  },
];

// ── Hero: dark model-overview preview card ──────────────────────────────────

function RiskBar({
  low, medium, high,
}: { low: number; medium: number; high: number }) {
  const segments = [
    { label: "Low", value: low, color: "#3E9C6E" },
    { label: "Medium", value: medium, color: "#D69B3A" },
    { label: "High", value: high, color: "#C4607A" },
  ];
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${Math.max(0, Math.min(100, s.value))}%`, backgroundColor: s.color }}
            className="h-full"
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/60">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
            {s.label} {s.value.toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewMeta({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
      <p className={cn("mt-1 font-mono text-sm font-medium tabular-nums", accent ? "text-[#C4607A]" : "text-white")}>
        {value}
      </p>
    </div>
  );
}

function HeroPreview() {
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth({ refetchInterval: 60_000 });
  const { data: overview, isLoading: overviewLoading } = useOverview({ refetchInterval: 60_000 });
  const { data: meta } = useMetadata();

  const isLoading = healthLoading || overviewLoading;
  const connected = !!health && !healthError;
  const modelReady = health?.model?.available ?? false;
  const datasetReady = health?.dataset?.available ?? false;

  return (
    <div className="relative">
      {/* soft editorial shadow backdrop */}
      <div className="absolute -inset-3 -z-10 rounded-[28px] bg-primary/5 blur-2xl" aria-hidden />

      <div className="overflow-hidden rounded-2xl bg-[#15140F] shadow-2xl ring-1 ring-black/5">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-[11px] text-white/40">churnguard / model-overview</span>
          </div>
          {connected && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#7FBFA4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7FBFA4]" aria-hidden />
              connected
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" aria-label="Loading model overview" />
          </div>
        )}

        {!isLoading && !connected && (
          <div className="min-h-[360px] space-y-4 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#D69B3A]" aria-hidden />
              <div>
                <p className="text-sm font-medium text-white">Backend not connected</p>
                <p className="mt-1 text-xs text-white/50">
                  Start the FastAPI server to load real dataset and model metrics here.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="font-mono text-[11px] leading-relaxed text-white/50">
                uvicorn app.main:app --host 127.0.0.1 --port 8000
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-white/35">
              No live values are shown while the API is offline — this panel never substitutes sample data.
            </p>
          </div>
        )}

        {!isLoading && connected && (
          <div className="space-y-5 p-6">
            {/* Headline metric */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/45">Historical churn rate</p>
              <div className="mt-1 flex items-end gap-3">
                <span className="font-serif text-5xl leading-none text-white tabular-nums">
                  {overview && datasetReady
                    ? formatPercent(overview.historical.actual_churn_rate)
                    : "—"}
                </span>
                <span className="mb-1 font-mono text-[11px] text-white/40">actual · static dataset</span>
              </div>
            </div>

            {/* Risk distribution */}
            {overview && datasetReady && modelReady && (
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider text-white/45">
                    Active risk distribution
                  </p>
                  <p className="font-mono text-[11px] text-white/40">eligible population</p>
                </div>
                <RiskBar
                  low={overview.active_customer_risk.risk_percentages.Low ?? 0}
                  medium={overview.active_customer_risk.risk_percentages.Medium ?? 0}
                  high={overview.active_customer_risk.risk_percentages.High ?? 0}
                />
              </div>
            )}

            {/* Compact metrics */}
            {overview && datasetReady && (
              <div className="grid grid-cols-3 gap-2">
                <PreviewMeta label="Customers" value={formatNumber(overview.historical.total_customers)} />
                <PreviewMeta
                  label="Eligible"
                  value={modelReady ? formatNumber(overview.active_customer_risk.eligible_customer_count) : "—"}
                />
                <PreviewMeta
                  label="High risk"
                  value={modelReady ? formatNumber(overview.active_customer_risk.risk_counts.High) : "—"}
                  accent
                />
              </div>
            )}

            {/* Model footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              {meta?.model?.available ? (
                <p className="font-mono text-[11px] text-white/50">
                  {meta.model.model_name}
                  {meta.model.model_version && <span className="text-white/30"> v{meta.model.model_version}</span>}
                </p>
              ) : (
                <p className="font-mono text-[11px] text-white/40">no active model</p>
              )}
              {meta?.dataset?.row_count != null && (
                <p className="font-mono text-[11px] text-white/40">
                  {formatNumber(meta.dataset.row_count)} rows
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Readiness strip ─────────────────────────────────────────────────────────

function ReadinessChip({ label, ready }: { label: string; ready: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        ready
          ? "border-primary/25 bg-primary/8 text-primary"
          : "border-border-base bg-surface-muted text-muted-foreground",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", ready ? "bg-primary" : "bg-muted-foreground")}
        aria-hidden
      />
      {label}
      <span className="font-mono text-[10px] opacity-70">{ready ? "ready" : "unavailable"}</span>
    </span>
  );
}

function ReadinessStrip() {
  const { data: health } = useHealth({ refetchInterval: 60_000 });
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <ReadinessChip label="API" ready={!!health} />
      <ReadinessChip label="Dataset" ready={health?.dataset?.available ?? false} />
      <ReadinessChip label="Model" ready={health?.model?.available ?? false} />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border-base bg-background/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" aria-hidden />
              </span>
              <span className="text-sm font-semibold tracking-tight">ChurnGuard AI</span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                asChild
                className="hidden rounded-full bg-[#15140F] px-4 text-[13px] text-white hover:bg-[#26241C] sm:inline-flex"
              >
                <Link to="/dashboard/overview">
                  Open dashboard
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {menuOpen && (
            <nav
              className="flex flex-col gap-1 border-t border-border-base py-3 md:hidden"
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/dashboard/overview"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Open dashboard
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="hero-warm border-b border-border-base">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Customer churn intelligence
                </p>
                <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  See churn risk clearly.{" "}
                  <span className="italic text-primary">Decide what to do next.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Explore customer behavior, evaluate churn models, and inspect the factors behind every
                  prediction — all in one interactive analytics workspace.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 rounded-full bg-primary px-6 text-white shadow-sm hover:bg-primary-hover"
                  >
                    <Link to="/dashboard/overview">
                      Explore the workspace
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    How it works
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>

                <div className="mt-10">
                  <ReadinessStrip />
                </div>
              </div>

              <div className="lg:pl-4">
                <HeroPreview />
              </div>
            </div>
          </div>
        </section>

        {/* From raw data to actionable insight */}
        <section id="platform" className="border-b border-border-base py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">The workspace</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                From raw data to actionable insight
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Every component of the ML workflow — data exploration, model evaluation, prediction, and
                scenario analysis — accessible in a single workspace.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((card) => (
                <article
                  key={card.title}
                  className="flex flex-col rounded-2xl border border-border-base bg-[#FFFEFC] p-7 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-4xl leading-none text-primary">{card.stat}</span>
                      <span className="text-xs text-muted-foreground">{card.statLabel}</span>
                    </div>
                    <card.icon className="h-5 w-5 text-primary/70" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
                  <p className="mt-6 inline-flex w-fit rounded-md bg-surface-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                    {card.tag}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-primary px-6 py-6 text-center sm:px-10">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 sm:text-sm">
                Explore data
                <span className="mx-2 text-white/50" aria-hidden>→</span>
                Evaluate models
                <span className="mx-2 text-white/50" aria-hidden>→</span>
                Explain predictions
                <span className="mx-2 text-white/50" aria-hidden>→</span>
                Take action
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-border-base py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Workflow</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                A straightforward four-step workflow from raw data to scored, explained predictions.
              </p>
            </div>

            <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {WORKFLOW_STEPS.map((step) => (
                <li key={step.num} className="border-t border-border-base pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl text-primary">{step.num}</span>
                    <step.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Explainable ML */}
        <section id="explainability" className="border-b border-border-base py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Explainable ML</p>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Model predictions you can reason about
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  ChurnGuard AI uses single-feature baseline perturbation to explain each individual
                  prediction. Instead of a black-box score, see which features pushed probability up or
                  down compared with a baseline.
                </p>
                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border-base bg-surface-muted px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Feature contributions describe model behaviour relative to a baseline — they are not
                    causal explanations, and probabilities are estimates rather than guarantees.
                  </p>
                </div>
                <Button
                  asChild
                  className="mt-7 h-10 rounded-full bg-primary px-5 text-white hover:bg-primary-hover"
                >
                  <Link to="/dashboard/predict">
                    Try a prediction
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {EXPLAINABILITY.map((item) => (
                  <div key={item.term} className="rounded-2xl border border-border-base bg-[#FFFEFC] p-5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                      <h3 className="text-sm font-semibold text-foreground">{item.term}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-[#15140F] px-6 py-14 text-center sm:px-12">
              <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start exploring the data
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
                Inspect dataset distributions, compare model performance, score individual customers, and run
                batch predictions — no signup required.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 h-11 rounded-full bg-primary px-6 text-white hover:bg-primary-hover"
              >
                <Link to="/dashboard/overview">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-base py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Shield className="h-3.5 w-3.5 text-primary-foreground" aria-hidden />
              </span>
              <span className="text-sm font-semibold">ChurnGuard AI</span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground" aria-label="Footer">
              <Link to="/dashboard/overview" className="transition-colors hover:text-foreground">Dashboard</Link>
              <Link to="/dashboard/dataset" className="transition-colors hover:text-foreground">Dataset Explorer</Link>
              <Link to="/dashboard/model-lab" className="transition-colors hover:text-foreground">Model Lab</Link>
              <Link to="/dashboard/system" className="transition-colors hover:text-foreground">System Status</Link>
            </nav>
          </div>
          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground/80">
            Model estimates are probabilistic outputs from a trained classifier — not guarantees, legal
            decisions, or causal conclusions. Historical dataset: Kaggle Telco Customer Churn (static
            snapshot, no live telecom feed). Statistics shown are loaded from the ChurnGuard AI API.
            &copy; {new Date().getFullYear()} ChurnGuard AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
