/**
 * ChurnGuard AI — API TypeScript DTOs
 *
 * All types derived from the actual FastAPI backend schemas.
 * These are NOT invented — they match the backend Pydantic models and route responses.
 */

// ─── Health & Metadata ──────────────────────────────────────────────────────

export interface HealthResponse {
  status: "ok" | "degraded";
  api: "ready";
  dataset: {
    available: boolean;
    row_count: number | null;
    message: string | null;
  };
  model: {
    available: boolean;
    model_name: string | null;
    message: string | null;
  };
  database: string;
  generated_at: string;
}

export interface MetadataResponse {
  application: {
    name: string;
    version: string;
    environment: string;
  };
  dataset: {
    available: boolean;
    source: string | null;
    filename: string | null;
    row_count: number | null;
    column_count: number | null;
    columns: string[];
    target_column: string;
    loaded_at: string | null;
    fingerprint_sha256: string | null;
    message: string | null;
  };
  model: {
    available: boolean;
    model_name: string | null;
    model_version: string | null;
    trained_at: string | null;
    training_row_count: number | null;
    test_row_count: number | null;
    message: string | null;
  };
}

// ─── Overview ────────────────────────────────────────────────────────────────

export interface OverviewResponse {
  historical: {
    total_customers: number;
    churned_customers: number;
    retained_customers: number;
    actual_churn_rate: number;
  };
  active_customer_risk: {
    eligible_customer_count: number | null;
    risk_counts: {
      Low: number | null;
      Medium: number | null;
      High: number | null;
    };
    risk_percentages: {
      Low: number | null;
      Medium: number | null;
      High: number | null;
    };
    average_predicted_probability: number | null;
    risk_weighted_monthly_charges_estimate: number | null;
    financial_metric_note: string;
  };
  model: {
    available: boolean;
    model_name: string | null;
    model_version: string | null;
    metrics: Record<string, number> | null;
  };
  prediction_history: {
    saved_predictions: number;
  };
  dataset: {
    version: string | null;
    loaded_at: string | null;
  };
  generated_at: string;
}

// ─── Dataset ─────────────────────────────────────────────────────────────────

export interface DatasetSummaryResponse {
  available: boolean;
  dimensions?: { rows: number; columns: number };
  target_distribution?: { Yes: number; No: number; churn_rate: number };
  cleaning_report?: Record<string, unknown>;
  fingerprint_sha256?: string;
  loaded_at?: string;
}

export interface DatasetPreviewResponse {
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  data: Record<string, unknown>[];
  dataset_version: string | null;
}

export interface DatasetProfileResponse {
  numerical?: Record<string, {
    count: number;
    mean: number;
    std: number;
    min: number;
    "25%": number;
    "50%": number;
    "75%": number;
    max: number;
  }>;
  categorical?: Record<string, {
    count: number;
    unique: number;
    top: string;
    freq: number;
    top_values?: Array<{ value: string; count: number; percent: number }>;
  }>;
}

export interface MissingValuesResponse {
  columns: Array<{
    column: string;
    missing_before: number;
    missing_after: number;
    percent_before: number;
    percent_after: number;
    action?: string;
  }>;
  dataset_version: string | null;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

/** Standard chart response returned by most analytics endpoints */
export interface ChartResponse {
  chart_type: string;
  title: string;
  x_key?: string;
  series: Array<{ key: string; label: string; color?: string }>;
  data: Record<string, unknown>[];
  meta: Record<string, unknown>;
}

/** customer-distribution returns a different structure */
export interface CustomerDistributionResponse {
  charts: Record<string, ChartResponse>;
  dataset_version: string | null;
}

export interface RiskDistributionResponse {
  status: "available" | "unavailable";
  reason?: string;
  chart_type?: string;
  title?: string;
  x_key?: string;
  series?: Array<{ key: string; label: string }>;
  data?: Record<string, unknown>[];
  meta?: Record<string, unknown>;
}

export interface FeatureImportanceResponse {
  status: "available" | "unavailable";
  reason?: string;
  method?: string;
  interpretation?: string;
  features?: Array<{ feature: string; importance: number; direction?: string }>;
  data?: Array<{ feature: string; importance: number }>;
  meta?: Record<string, unknown>;
}

export interface ModelComparisonResponse {
  status: "available" | "unavailable";
  reason?: string;
  selected_model?: string;
  selection_criterion?: string;
  data?: Array<Record<string, unknown>>;
}

export interface ConfusionMatrixResponse {
  status?: "available" | "unavailable";
  reason?: string;
  matrix?: number[][];
  labels?: string[];
  counts?: Record<string, number>;
  chart_type?: string;
  data?: Record<string, unknown>[];
  meta?: Record<string, unknown>;
}

export interface CurveDataResponse {
  status: "available" | "unavailable";
  reason?: string;
  data?: Array<{ x: number; y: number; threshold?: number }>;
  auc?: number;
  meta?: Record<string, unknown>;
}

export interface ThresholdComparisonResponse {
  status: "available" | "unavailable";
  reason?: string;
  data?: Array<Record<string, unknown>>;
  note?: string;
}

// ─── Customers ───────────────────────────────────────────────────────────────

export interface CustomerRecord {
  customerID: string;
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number | null;
  Churn: string;
  churn_probability?: number;
  risk_category?: RiskCategory;
  prediction?: CustomerPrediction;
}

export interface CustomerPrediction {
  churn_probability: number;
  predicted_churn: "Yes" | "No";
  risk_category: RiskCategory;
}

export interface CustomersListResponse {
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  data: CustomerRecord[];
}

export interface CustomerDetailResponse extends CustomerRecord {
  prediction?: CustomerPrediction;
}

export interface CustomerPredictionResponse {
  customer_id: string;
  churn_probability: number;
  predicted_churn: "Yes" | "No";
  risk_category: RiskCategory;
  model_version: string | null;
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export type RiskCategory = "Low" | "Medium" | "High";

export interface CustomerFeatures {
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number | null;
}

export interface ExplanationFeature {
  feature: string;
  value?: unknown;
  baseline_value?: unknown;
  contribution: number;
  direction: "increases" | "decreases" | "neutral" | string;
  importance?: number;
  contribution_scale?: string;
}

export interface PredictionExplanation {
  status: "available" | "unavailable" | "not_requested" | string;
  method: string | null;
  top_features: ExplanationFeature[];
  interpretation_note?: string;
  contribution_scale?: string;
}

export interface PredictionResponse {
  churn_probability: number;
  predicted_churn: "Yes" | "No";
  risk_category: RiskCategory;
  thresholds: Record<string, number>;
  model_name: string | null;
  model_version: string | null;
  explanation: PredictionExplanation;
  prediction_id: number | null;
  generated_at: string;
}

// ─── Batch Predictions ───────────────────────────────────────────────────────

export interface BatchResultRow {
  source_row: number;
  customerID: string | null;
  churn_probability: number;
  predicted_churn: "Yes" | "No";
  risk_category: RiskCategory;
  model_version: string | null;
  prediction_id: number;
  [key: string]: unknown;
}

export interface BatchErrorRow {
  source_row: number;
  customerID: string | null;
  error: string;
}

export interface BatchPredictionResponse {
  batch_id: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  target_column_ignored: boolean;
  results: BatchResultRow[];
  errors: BatchErrorRow[];
  download_url: string | null;
  generated_at: string;
}

// ─── Prediction History ───────────────────────────────────────────────────────

export interface HistoryRecord {
  id: number;
  created_at: string;
  customer_id: string | null;
  churn_probability: number;
  predicted_churn: "Yes" | "No";
  risk_category: RiskCategory;
  model_version: string | null;
  explanation_summary: string | null;
}

export interface HistoryDetailRecord extends HistoryRecord {
  input_snapshot: CustomerFeatures | null;
}

export interface HistoryListResponse {
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  data: HistoryRecord[];
}

// ─── What-if / Scenarios ─────────────────────────────────────────────────────

export interface WhatIfVariant {
  name: string;
  changes: Record<string, string | number | null>;
}

export interface WhatIfRequest {
  customer: CustomerFeatures;
  scenarios: WhatIfVariant[];
}

export interface ScenarioResult {
  name: string;
  changes: Record<string, unknown>;
  churn_probability: number;
  predicted_churn: "Yes" | "No";
  risk_category: RiskCategory;
  absolute_probability_difference: number;
  interpretation_note?: string;
}

export interface WhatIfResponse {
  baseline: {
    churn_probability: number;
    predicted_churn: "Yes" | "No";
    risk_category: RiskCategory;
  };
  scenarios: ScenarioResult[];
  model_version: string | null;
  note: string;
  generated_at: string | null;
}

// ─── Model ───────────────────────────────────────────────────────────────────

export interface ModelStatusResponse {
  available: boolean;
  model_name: string | null;
  model_version: string | null;
  trained_at: string | null;
  evaluation_metrics: Record<string, number> | null;
  artifact_directory_configured: boolean;
  error: string | null;
}

export interface ModelMetricsResponse {
  status: "available" | "unavailable";
  reason?: string;
  model_name?: string;
  model_version?: string;
  metrics?: Record<string, number>;
  classification_report?: Record<string, unknown>;
  evaluation_dataset?: string;
}

// ─── Filter types ─────────────────────────────────────────────────────────────

export interface CustomerFilters {
  limit?: number;
  offset?: number;
  search?: string;
  risk_category?: RiskCategory | "";
  contract?: string;
  min_tenure?: number;
  max_tenure?: number;
  min_monthly_charges?: number;
  max_monthly_charges?: number;
  internet_service?: string;
  payment_method?: string;
  min_probability?: number;
  max_probability?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface HistoryFilters {
  limit?: number;
  offset?: number;
  risk_category?: RiskCategory | "";
}
