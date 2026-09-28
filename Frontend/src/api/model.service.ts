import { getJson } from "./client";
import type { ModelStatusResponse, ModelMetricsResponse, ModelComparisonResponse } from "@/types/api";

export const modelService = {
  getStatus: () => getJson<ModelStatusResponse>("/model/status"),
  getMetrics: () => getJson<ModelMetricsResponse>("/model/metrics"),
  getComparison: () => getJson<ModelComparisonResponse>("/model/comparison"),
};
