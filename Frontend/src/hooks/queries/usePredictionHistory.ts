import { useQuery } from "@tanstack/react-query";
import { predictionsService } from "@/api/predictions.service";
import type { HistoryFilters } from "@/types/api";

export const HISTORY_KEYS = {
  list: (filters: HistoryFilters) => ["prediction-history", "list", filters] as const,
  detail: (id: number) => ["prediction-history", "detail", id] as const,
};

export function usePredictionHistory(filters: HistoryFilters = {}) {
  return useQuery({
    queryKey: HISTORY_KEYS.list(filters),
    queryFn: () => predictionsService.getHistory(filters),
    staleTime: 30_000,
    retry: 1,
  });
}

export function usePredictionDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: HISTORY_KEYS.detail(id),
    queryFn: () => predictionsService.getHistoryDetail(id),
    staleTime: 5 * 60_000,
    enabled: enabled && id > 0,
    retry: 1,
  });
}
