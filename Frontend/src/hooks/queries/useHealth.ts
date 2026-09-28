import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/api/health.service";
import { overviewService } from "@/api/overview.service";

export const QUERY_KEYS = {
  health: ["health"] as const,
  metadata: ["metadata"] as const,
  overview: ["overview"] as const,
};

export function useHealth(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: healthService.getHealth,
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval ?? 60_000,
    retry: 1,
  });
}

export function useMetadata(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.metadata,
    queryFn: healthService.getMetadata,
    staleTime: 60_000,
    refetchInterval: options?.refetchInterval ?? 60_000,
    retry: 1,
  });
}

export function useOverview(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.overview,
    queryFn: overviewService.getOverview,
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval ?? 60_000,
    retry: 1,
  });
}
