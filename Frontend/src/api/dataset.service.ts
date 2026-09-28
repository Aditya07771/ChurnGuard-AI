import { getJson } from "./client";
import type {
  DatasetSummaryResponse,
  DatasetPreviewResponse,
  DatasetProfileResponse,
  MissingValuesResponse,
} from "@/types/api";

export const datasetService = {
  getSummary: () => getJson<DatasetSummaryResponse>("/dataset/summary"),
  getPreview: (params: {
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }) => {
    const q = new URLSearchParams();
    if (params.limit !== undefined) q.set("limit", String(params.limit));
    if (params.offset !== undefined) q.set("offset", String(params.offset));
    if (params.sort_by) q.set("sort_by", params.sort_by);
    if (params.sort_order) q.set("sort_order", params.sort_order);
    return getJson<DatasetPreviewResponse>(`/dataset/preview?${q}`);
  },
  getProfile: () => getJson<DatasetProfileResponse>("/dataset/profile"),
  getMissingValues: () => getJson<MissingValuesResponse>("/dataset/missing-values"),
};
