import { getJson } from "./client";
import type { HealthResponse, MetadataResponse } from "@/types/api";

export const healthService = {
  getHealth: () => getJson<HealthResponse>("/health"),
  getMetadata: () => getJson<MetadataResponse>("/metadata"),
};
