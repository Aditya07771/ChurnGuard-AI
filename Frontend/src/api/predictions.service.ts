import { getJson, postJson, postForm, getDownload } from "./client";
import type {
  CustomerFeatures,
  PredictionResponse,
  BatchPredictionResponse,
  HistoryListResponse,
  HistoryDetailRecord,
  HistoryFilters,
} from "@/types/api";

export const predictionsService = {
  predict: (customer: CustomerFeatures) =>
    postJson<PredictionResponse>("/predictions", customer),

  uploadBatch: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return postForm<BatchPredictionResponse>("/predictions/batch", formData);
  },

  downloadBatch: (batchId: string) => getDownload(`/predictions/batch/${batchId}/download`),

  getHistory: (filters: HistoryFilters = {}) => {
    const q = new URLSearchParams();
    if (filters.limit !== undefined) q.set("limit", String(filters.limit));
    if (filters.offset !== undefined) q.set("offset", String(filters.offset));
    if (filters.risk_category) q.set("risk_category", filters.risk_category);
    const query = q.toString() ? `?${q}` : "";
    return getJson<HistoryListResponse>(`/predictions/history${query}`);
  },

  getHistoryDetail: (predictionId: number) =>
    getJson<HistoryDetailRecord>(`/predictions/history/${predictionId}`),
};
