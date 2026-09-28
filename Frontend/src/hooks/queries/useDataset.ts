import { useQuery } from "@tanstack/react-query";
import { datasetService } from "@/api/dataset.service";

export const DATASET_KEYS = {
  summary: ["dataset", "summary"] as const,
  preview: (params: object) => ["dataset", "preview", params] as const,
  profile: ["dataset", "profile"] as const,
  missingValues: ["dataset", "missing-values"] as const,
};

export function useDatasetSummary() {
  return useQuery({
    queryKey: DATASET_KEYS.summary,
    queryFn: datasetService.getSummary,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useDatasetPreview(params: {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: DATASET_KEYS.preview(params),
    queryFn: () => datasetService.getPreview(params),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useDatasetProfile() {
  return useQuery({
    queryKey: DATASET_KEYS.profile,
    queryFn: datasetService.getProfile,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function useDatasetMissingValues() {
  return useQuery({
    queryKey: DATASET_KEYS.missingValues,
    queryFn: datasetService.getMissingValues,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
