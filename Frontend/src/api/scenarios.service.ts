import { postJson } from "./client";
import type { WhatIfRequest, WhatIfResponse } from "@/types/api";

export const scenariosService = {
  runWhatIf: (request: WhatIfRequest) =>
    postJson<WhatIfResponse>("/scenarios/what-if", request),
};
