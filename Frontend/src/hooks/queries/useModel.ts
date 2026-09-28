import { useQuery } from "@tanstack/react-query";
import { modelService } from "@/api/model.service";

export const MODEL_KEYS = {
  status: ["model", "status"] as const,
  metrics: ["model", "metrics"] as const,
  comparison: ["model", "comparison"] as const,
};

export function useModelStatus() {
  return useQuery({
    queryKey: MODEL_KEYS.status,
    queryFn: modelService.getStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useModelMetrics() {
  return useQuery({
    queryKey: MODEL_KEYS.metrics,
    queryFn: modelService.getMetrics,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useModelComparison() {
  return useQuery({
    queryKey: MODEL_KEYS.comparison,
    queryFn: modelService.getComparison,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
