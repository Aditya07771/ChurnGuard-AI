import { useMutation, useQueryClient } from "@tanstack/react-query";
import { predictionsService } from "@/api/predictions.service";
import { scenariosService } from "@/api/scenarios.service";
import type { CustomerFeatures, WhatIfRequest } from "@/types/api";
import { QUERY_KEYS } from "@/hooks/queries/useHealth";

/** Mutation for single customer prediction — invalidates overview + history after success */
export function usePredictMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (customer: CustomerFeatures) => predictionsService.predict(customer),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.overview });
      void qc.invalidateQueries({ queryKey: ["prediction-history"] });
    },
  });
}

/** Mutation for batch CSV upload */
export function useBatchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => predictionsService.uploadBatch(file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.overview });
      void qc.invalidateQueries({ queryKey: ["prediction-history"] });
    },
  });
}

/** Mutation for what-if scenario analysis */
export function useWhatIfMutation() {
  return useMutation({
    mutationFn: (request: WhatIfRequest) => scenariosService.runWhatIf(request),
  });
}
