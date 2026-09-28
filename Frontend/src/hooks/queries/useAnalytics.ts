import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/api/analytics.service";

export const ANALYTICS_KEYS = {
  churnByContract: ["analytics", "churn-by-contract"] as const,
  churnByTenure: ["analytics", "churn-by-tenure"] as const,
  churnByPaymentMethod: ["analytics", "churn-by-payment-method"] as const,
  churnByInternetService: ["analytics", "churn-by-internet-service"] as const,
  churnByService: ["analytics", "churn-by-service"] as const,
  chargesDistribution: ["analytics", "charges-distribution"] as const,
  churnByDemographics: ["analytics", "churn-by-demographics"] as const,
  tenureDistribution: ["analytics", "tenure-distribution"] as const,
  customerDistribution: ["analytics", "customer-distribution"] as const,
  riskDistribution: ["analytics", "risk-distribution"] as const,
  featureImportance: ["analytics", "feature-importance"] as const,
  modelComparison: ["analytics", "model-comparison"] as const,
  confusionMatrix: ["analytics", "confusion-matrix"] as const,
  rocCurve: ["analytics", "roc-curve"] as const,
  precisionRecallCurve: ["analytics", "precision-recall-curve"] as const,
  thresholdComparison: ["analytics", "threshold-comparison"] as const,
};

const STALE = 5 * 60_000;

export function useChurnByContract() {
  return useQuery({ queryKey: ANALYTICS_KEYS.churnByContract, queryFn: analyticsService.getChurnByContract, staleTime: STALE, retry: 1 });
}
export function useChurnByTenure() {
  return useQuery({ queryKey: ANALYTICS_KEYS.churnByTenure, queryFn: analyticsService.getChurnByTenure, staleTime: STALE, retry: 1 });
}
export function useChurnByPaymentMethod() {
  return useQuery({ queryKey: ANALYTICS_KEYS.churnByPaymentMethod, queryFn: analyticsService.getChurnByPaymentMethod, staleTime: STALE, retry: 1 });
}
export function useChurnByInternetService() {
  return useQuery({ queryKey: ANALYTICS_KEYS.churnByInternetService, queryFn: analyticsService.getChurnByInternetService, staleTime: STALE, retry: 1 });
}
export function useChurnByService() {
  return useQuery({ queryKey: ANALYTICS_KEYS.churnByService, queryFn: analyticsService.getChurnByService, staleTime: STALE, retry: 1 });
}
export function useChargesDistribution() {
  return useQuery({ queryKey: ANALYTICS_KEYS.chargesDistribution, queryFn: analyticsService.getChargesDistribution, staleTime: STALE, retry: 1 });
}
export function useChurnByDemographics() {
  return useQuery({ queryKey: ANALYTICS_KEYS.churnByDemographics, queryFn: analyticsService.getChurnByDemographics, staleTime: STALE, retry: 1 });
}
export function useTenureDistribution() {
  return useQuery({ queryKey: ANALYTICS_KEYS.tenureDistribution, queryFn: analyticsService.getTenureDistribution, staleTime: STALE, retry: 1 });
}
export function useCustomerDistribution() {
  return useQuery({ queryKey: ANALYTICS_KEYS.customerDistribution, queryFn: analyticsService.getCustomerDistribution, staleTime: STALE, retry: 1 });
}
export function useRiskDistribution() {
  return useQuery({ queryKey: ANALYTICS_KEYS.riskDistribution, queryFn: analyticsService.getRiskDistribution, staleTime: STALE, retry: 1 });
}
export function useFeatureImportance() {
  return useQuery({ queryKey: ANALYTICS_KEYS.featureImportance, queryFn: analyticsService.getFeatureImportance, staleTime: STALE, retry: 1 });
}
export function useModelComparison() {
  return useQuery({ queryKey: ANALYTICS_KEYS.modelComparison, queryFn: analyticsService.getModelComparison, staleTime: STALE, retry: 1 });
}
export function useConfusionMatrix() {
  return useQuery({ queryKey: ANALYTICS_KEYS.confusionMatrix, queryFn: analyticsService.getConfusionMatrix, staleTime: STALE, retry: 1 });
}
export function useRocCurve() {
  return useQuery({ queryKey: ANALYTICS_KEYS.rocCurve, queryFn: analyticsService.getRocCurve, staleTime: STALE, retry: 1 });
}
export function usePrecisionRecallCurve() {
  return useQuery({ queryKey: ANALYTICS_KEYS.precisionRecallCurve, queryFn: analyticsService.getPrecisionRecallCurve, staleTime: STALE, retry: 1 });
}
export function useThresholdComparison() {
  return useQuery({ queryKey: ANALYTICS_KEYS.thresholdComparison, queryFn: analyticsService.getThresholdComparison, staleTime: STALE, retry: 1 });
}
