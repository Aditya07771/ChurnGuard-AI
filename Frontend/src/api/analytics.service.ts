import { getJson } from "./client";
import type {
  ChartResponse,
  CustomerDistributionResponse,
  RiskDistributionResponse,
  FeatureImportanceResponse,
  ModelComparisonResponse,
  ConfusionMatrixResponse,
  CurveDataResponse,
  ThresholdComparisonResponse,
} from "@/types/api";

export const analyticsService = {
  getChurnByContract: () => getJson<ChartResponse>("/analytics/churn-by-contract"),
  getChurnByTenure: () => getJson<ChartResponse>("/analytics/churn-by-tenure"),
  getChurnByPaymentMethod: () => getJson<ChartResponse>("/analytics/churn-by-payment-method"),
  getChurnByInternetService: () => getJson<ChartResponse>("/analytics/churn-by-internet-service"),
  getChurnByService: () => getJson<ChartResponse>("/analytics/churn-by-service"),
  getChargesDistribution: () => getJson<ChartResponse>("/analytics/charges-distribution"),
  getChurnByDemographics: () => getJson<ChartResponse>("/analytics/churn-by-demographics"),
  getTenureDistribution: () => getJson<ChartResponse>("/analytics/tenure-distribution"),
  getCustomerDistribution: () =>
    getJson<CustomerDistributionResponse>("/analytics/customer-distribution"),
  getRiskDistribution: () => getJson<RiskDistributionResponse>("/analytics/risk-distribution"),
  getFeatureImportance: () =>
    getJson<FeatureImportanceResponse>("/analytics/feature-importance"),
  getModelComparison: () => getJson<ModelComparisonResponse>("/analytics/model-comparison"),
  getConfusionMatrix: () => getJson<ConfusionMatrixResponse>("/analytics/confusion-matrix"),
  getRocCurve: () => getJson<CurveDataResponse>("/analytics/roc-curve"),
  getPrecisionRecallCurve: () =>
    getJson<CurveDataResponse>("/analytics/precision-recall-curve"),
  getThresholdComparison: () =>
    getJson<ThresholdComparisonResponse>("/analytics/threshold-comparison"),
};
