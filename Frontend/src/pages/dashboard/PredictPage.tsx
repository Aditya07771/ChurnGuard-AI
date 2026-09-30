import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Brain,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiskBadge, PredictionBadge } from "@/components/data-display/Badges";
import { ExplanationBars } from "@/components/charts/DomainCharts";
import { ErrorState } from "@/components/feedback/ErrorState";

import { usePredictMutation } from "@/hooks/mutations/useMutations";
import type { CustomerFeatures, PredictionResponse } from "@/types/api";
import { formatPercent, formatDateTime } from "@/lib/utils";

// Schema matching backend CustomerFeatures strictly
const predictSchema = z.object({
  gender: z.enum(["Male", "Female"]),
  SeniorCitizen: z.coerce.number().int().min(0).max(1),
  Partner: z.enum(["Yes", "No"]),
  Dependents: z.enum(["Yes", "No"]),
  tenure: z.coerce.number().int().min(0).max(72),
  PhoneService: z.enum(["Yes", "No"]),
  MultipleLines: z.enum(["Yes", "No", "No phone service"]),
  InternetService: z.enum(["DSL", "Fiber optic", "No"]),
  OnlineSecurity: z.enum(["Yes", "No", "No internet service"]),
  OnlineBackup: z.enum(["Yes", "No", "No internet service"]),
  DeviceProtection: z.enum(["Yes", "No", "No internet service"]),
  TechSupport: z.enum(["Yes", "No", "No internet service"]),
  StreamingTV: z.enum(["Yes", "No", "No internet service"]),
  StreamingMovies: z.enum(["Yes", "No", "No internet service"]),
  Contract: z.enum(["Month-to-month", "One year", "Two year"]),
  PaperlessBilling: z.enum(["Yes", "No"]),
  PaymentMethod: z.enum([
    "Electronic check",
    "Mailed check",
    "Bank transfer (automatic)",
    "Credit card (automatic)",
  ]),
  MonthlyCharges: z.coerce.number().min(0).max(10000),
  TotalCharges: z.coerce.number().min(0).max(1000000).nullable(),
});

type PredictFormValues = z.infer<typeof predictSchema>;

const defaultValues: PredictFormValues = {
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

export default function PredictPage() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const predictMutation = usePredictMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PredictFormValues>({
    resolver: zodResolver(predictSchema) as any,
    defaultValues,
  });

  const onSubmit = (data: PredictFormValues) => {
    predictMutation.mutate(data as CustomerFeatures, {
      onSuccess: (res) => {
        setResult(res);
      },
    });
  };

  const handleReset = () => {
    reset(defaultValues);
    setResult(null);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        title="Prediction Studio"
        description="Score individual customer profiles with real-time ML inference and single-feature perturbation explanations"
        icon={Brain}
      />

      {/* Model explanation disclaimer banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-foreground">Local explainability:</span> Explanation features reflect baseline perturbation shifts calculated by the model. They highlight which attributes drove the estimated risk higher or lower for this specific profile, but do not imply causal real-world intervention efficacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Column */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Demographics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                1. Customer Profile
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="SeniorCitizen">Senior Citizen</Label>
                  <select
                    id="SeniorCitizen"
                    {...register("SeniorCitizen")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="0">No (Under 65)</option>
                    <option value="1">Yes (65+)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="Partner">Partner</Label>
                  <select
                    id="Partner"
                    {...register("Partner")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="Dependents">Dependents</Label>
                  <select
                    id="Dependents"
                    {...register("Dependents")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Configuration */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                2. Subscribed Services
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <Label htmlFor="PhoneService">Phone Service</Label>
                  <select
                    id="PhoneService"
                    {...register("PhoneService")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="MultipleLines">Multiple Lines</Label>
                  <select
                    id="MultipleLines"
                    {...register("MultipleLines")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No phone service">No phone service</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="InternetService">Internet Service</Label>
                  <select
                    id="InternetService"
                    {...register("InternetService")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="DSL">DSL</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="OnlineSecurity">Online Security</Label>
                  <select
                    id="OnlineSecurity"
                    {...register("OnlineSecurity")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="OnlineBackup">Online Backup</Label>
                  <select
                    id="OnlineBackup"
                    {...register("OnlineBackup")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="DeviceProtection">Device Protection</Label>
                  <select
                    id="DeviceProtection"
                    {...register("DeviceProtection")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="TechSupport">Tech Support</Label>
                  <select
                    id="TechSupport"
                    {...register("TechSupport")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="StreamingTV">Streaming TV</Label>
                  <select
                    id="StreamingTV"
                    {...register("StreamingTV")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="StreamingMovies">Streaming Movies</Label>
                  <select
                    id="StreamingMovies"
                    {...register("StreamingMovies")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contract & Billing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                3. Contract & Billing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label htmlFor="Contract">Contract Term</Label>
                  <select
                    id="Contract"
                    {...register("Contract")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="PaperlessBilling">Paperless Billing</Label>
                  <select
                    id="PaperlessBilling"
                    {...register("PaperlessBilling")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="PaymentMethod">Payment Method</Label>
                  <select
                    id="PaymentMethod"
                    {...register("PaymentMethod")}
                    className="w-full mt-1 h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                    <option value="Credit card (automatic)">Credit card (automatic)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Numerical Inputs */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                4. Account Age & Charges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <Label htmlFor="tenure">Tenure (Months 0–72)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    min="0"
                    max="72"
                    step="1"
                    {...register("tenure")}
                    className="mt-1 h-8 text-xs"
                  />
                  {errors.tenure && (
                    <p className="text-destructive text-[10px] mt-0.5">{errors.tenure.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="MonthlyCharges">Monthly Charges ($)</Label>
                  <Input
                    id="MonthlyCharges"
                    type="number"
                    min="0"
                    step="0.05"
                    {...register("MonthlyCharges")}
                    className="mt-1 h-8 text-xs"
                  />
                  {errors.MonthlyCharges && (
                    <p className="text-destructive text-[10px] mt-0.5">
                      {errors.MonthlyCharges.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="TotalCharges">Total Invoiced ($)</Label>
                  <Input
                    id="TotalCharges"
                    type="number"
                    min="0"
                    step="0.05"
                    {...register("TotalCharges")}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {predictMutation.error && (
              <ErrorState error={predictMutation.error} title="Prediction request failed" compact />
            )}

            {/* Form Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={predictMutation.isPending}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {predictMutation.isPending ? "Evaluating Model..." : "Run Prediction"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={predictMutation.isPending}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 animate-in fade-in-50">
              <div className="border-b border-border pb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Inference Output #{result.prediction_id}
                </span>
                <div className="flex items-center justify-between mt-2">
                  <h3 className="text-2xl font-bold tabular-nums text-foreground">
                    {formatPercent(result.churn_probability)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <RiskBadge category={result.risk_category} />
                    <PredictionBadge predicted={result.predicted_churn} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Generated {formatDateTime(result.generated_at)} with {result.model_name ?? "classifier"} ({result.model_version ?? "v1.0.0"})
                </p>
              </div>

              {/* Threshold context */}
              <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-semibold text-foreground">Operating Thresholds</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Low risk ceiling: {((result.thresholds?.low_risk ?? 0.3) * 100).toFixed(0)}%</div>
                  <div>High risk floor: {((result.thresholds?.high_risk ?? 0.7) * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Baseline Perturbation Explanation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Feature Contributions
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    Method: {result.explanation.method ?? "baseline perturbation"}
                  </span>
                </div>

                {result.explanation.top_features?.length > 0 ? (
                  <div>
                    <ExplanationBars features={result.explanation.top_features} height={240} />
                    <p className="text-[11px] text-muted-foreground mt-2 italic leading-relaxed">
                      {result.explanation.interpretation_note ??
                        "Bars indicate how much altering each feature from the population baseline moves estimated churn probability. Red bars increase risk; green bars reduce risk."}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No individual feature explanations available for this prediction.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center space-y-3">
              <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">Ready for Evaluation</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Fill in the customer attributes on the left and click "Run Prediction" to compute churn risk and local feature contributions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
