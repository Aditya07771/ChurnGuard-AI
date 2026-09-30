import { useState } from "react";
import {
  FlaskConical,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiskBadge, PredictionBadge } from "@/components/data-display/Badges";
import { ErrorState } from "@/components/feedback/ErrorState";

import { useWhatIfMutation } from "@/hooks/mutations/useMutations";
import type {
  CustomerFeatures,
  WhatIfRequest,
  WhatIfResponse,
  WhatIfVariant,
} from "@/types/api";
import { formatPercent, formatProbabilityDiff } from "@/lib/utils";

const defaultBaseline: CustomerFeatures = {
  gender: "Female",
  SeniorCitizen: 0,
  Partner: "No",
  Dependents: "No",
  tenure: 12,
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "Yes",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "Yes",
  StreamingMovies: "No",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: 79.85,
  TotalCharges: 958.2,
};

const initialScenarios: WhatIfVariant[] = [
  {
    name: "Switch to One-Year Contract",
    changes: { Contract: "One year" },
  },
  {
    name: "Add Tech Support & Online Security",
    changes: { TechSupport: "Yes", OnlineSecurity: "Yes" },
  },
  {
    name: "Switch to Automatic Bank Transfer",
    changes: { PaymentMethod: "Bank transfer (automatic)" },
  },
];

export default function ScenariosPage() {
  const [baseline, setBaseline] = useState<CustomerFeatures>(defaultBaseline);
  const [scenarios, setScenarios] = useState<WhatIfVariant[]>(initialScenarios);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const whatIfMutation = useWhatIfMutation();

  const handleBaselineChange = (field: keyof CustomerFeatures, val: any) => {
    setBaseline((prev) => ({ ...prev, [field]: val }));
  };

  const handleAddScenario = () => {
    if (scenarios.length >= 10) return;
    setScenarios((prev) => [
      ...prev,
      {
        name: `Scenario ${prev.length + 1}`,
        changes: { Contract: "Two year" },
      },
    ]);
  };

  const handleRemoveScenario = (index: number) => {
    setScenarios((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateScenarioName = (index: number, name: string) => {
    setScenarios((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name };
      return copy;
    });
  };

  const handleUpdateScenarioChange = (
    scenarioIndex: number,
    field: string,
    value: string
  ) => {
    setScenarios((prev) => {
      const copy = [...prev];
      copy[scenarioIndex] = {
        ...copy[scenarioIndex],
        changes: { [field]: value },
      };
      return copy;
    });
  };

  const handleSubmit = () => {
    if (scenarios.length === 0) return;
    const payload: WhatIfRequest = {
      customer: baseline,
      scenarios,
    };
    whatIfMutation.mutate(payload, {
      onSuccess: (data) => {
        setResult(data);
      },
    });
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="What-if Scenario Laboratory"
        description="Simulate alternative customer attributes and compare model score deltas against a defined baseline"
        icon={FlaskConical}
      />

      {/* Non-causal notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold">Non-causal modeling disclaimer:</span> What-if outputs illustrate hypothetical scores produced by the existing statistical model. Changing an account attribute in the model does not prove or guarantee that a real-world business intervention will cause customer retention.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Baseline and Scenarios Setup */}
        <div className="lg:col-span-7 space-y-6">
          {/* Baseline Editor */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Baseline Customer Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <Label>Contract</Label>
                <select
                  value={baseline.Contract}
                  onChange={(e) => handleBaselineChange("Contract", e.target.value)}
                  className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>
              <div>
                <Label>Internet Service</Label>
                <select
                  value={baseline.InternetService}
                  onChange={(e) => handleBaselineChange("InternetService", e.target.value)}
                  className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="Fiber optic">Fiber optic</option>
                  <option value="DSL">DSL</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <Label>Payment Method</Label>
                <select
                  value={baseline.PaymentMethod}
                  onChange={(e) => handleBaselineChange("PaymentMethod", e.target.value)}
                  className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="Electronic check">Electronic check</option>
                  <option value="Mailed check">Mailed check</option>
                  <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                  <option value="Credit card (automatic)">Credit card (automatic)</option>
                </select>
              </div>
              <div>
                <Label>Tech Support</Label>
                <select
                  value={baseline.TechSupport}
                  onChange={(e) => handleBaselineChange("TechSupport", e.target.value)}
                  className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <Label>Online Security</Label>
                <select
                  value={baseline.OnlineSecurity}
                  onChange={(e) => handleBaselineChange("OnlineSecurity", e.target.value)}
                  className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <Label>Tenure (Months)</Label>
                <Input
                  type="number"
                  min="0"
                  max="72"
                  value={baseline.tenure}
                  onChange={(e) => handleBaselineChange("tenure", Number(e.target.value))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Scenarios List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Hypothetical Variants ({scenarios.length}/10)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure attribute adjustments to test against baseline
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddScenario}
                disabled={scenarios.length >= 10}
                className="gap-1 h-7 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Variant
              </Button>
            </div>

            <div className="space-y-3">
              {scenarios.map((sc, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      type="text"
                      value={sc.name}
                      onChange={(e) => handleUpdateScenarioName(idx, e.target.value)}
                      placeholder="Variant Name"
                      className="h-8 text-xs font-medium"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveScenario(idx)}
                      disabled={scenarios.length <= 1}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Changes selector */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Attribute to change</Label>
                      <select
                        value={Object.keys(sc.changes)[0] ?? "Contract"}
                        onChange={(e) => handleUpdateScenarioChange(idx, e.target.value, "One year")}
                        className="w-full mt-1 h-7 rounded border border-input bg-background px-2 text-xs"
                      >
                        <option value="Contract">Contract</option>
                        <option value="TechSupport">Tech Support</option>
                        <option value="OnlineSecurity">Online Security</option>
                        <option value="PaymentMethod">Payment Method</option>
                        <option value="PaperlessBilling">Paperless Billing</option>
                        <option value="InternetService">Internet Service</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Hypothetical value</Label>
                      <Input
                        type="text"
                        value={String(Object.values(sc.changes)[0] ?? "")}
                        onChange={(e) =>
                          handleUpdateScenarioChange(
                            idx,
                            Object.keys(sc.changes)[0] ?? "Contract",
                            e.target.value
                          )
                        }
                        className="mt-1 h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {whatIfMutation.error && (
              <ErrorState error={whatIfMutation.error} title="What-if simulation failed" compact />
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={whatIfMutation.isPending || scenarios.length === 0}
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {whatIfMutation.isPending ? "Evaluating Variants..." : "Run What-if Analysis"}
            </Button>
          </div>
        </div>

        {/* Right Column: Comparative Results */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5 animate-in fade-in-50">
              {/* Baseline Result Header */}
              <div className="rounded-lg bg-muted/40 p-4 border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Baseline Prediction
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {formatPercent(result.baseline.churn_probability)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge category={result.baseline.risk_category} size="sm" />
                    <PredictionBadge predicted={result.baseline.predicted_churn} />
                  </div>
                </div>
              </div>

              {/* Scenarios Comparison List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Simulated Outcomes
                </h4>
                {result.scenarios.map((sc, i) => {
                  const diff = sc.absolute_probability_difference;
                  const isLower = diff < 0;
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-3.5 space-y-2 bg-card/60 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{sc.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {JSON.stringify(sc.changes)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums text-foreground">
                            {formatPercent(sc.churn_probability)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
                              isLower ? "text-green-600" : "text-rose-600"
                            }`}
                          >
                            {isLower ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <TrendingUp className="h-3 w-3" />
                            )}
                            {formatProbabilityDiff(diff)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                        <RiskBadge category={sc.risk_category} size="sm" />
                        <PredictionBadge predicted={sc.predicted_churn} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {result.note && (
                <p className="text-[11px] text-muted-foreground italic leading-relaxed border-t border-border pt-3">
                  {result.note}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center space-y-3">
              <FlaskConical className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">Ready for Simulation</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Configure your baseline account on the left, declare hypothetical changes, and evaluate the resulting risk differentials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
