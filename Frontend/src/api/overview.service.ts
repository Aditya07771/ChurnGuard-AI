import { getJson } from "./client";
import type { OverviewResponse } from "@/types/api";

export const overviewService = {
  getOverview: () => getJson<OverviewResponse>("/overview"),
};
