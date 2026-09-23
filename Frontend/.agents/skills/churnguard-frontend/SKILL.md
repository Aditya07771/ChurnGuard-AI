---
name: churnguard-frontend
description: Builds and verifies the ChurnGuard AI React frontend, with an aesthetic analytics UI and complete typed integration to the existing FastAPI churn prediction backend.
---

# ChurnGuard AI Frontend Implementation Skill

Use this skill when creating, extending, integrating, or auditing the ChurnGuard AI website and dashboard.

## Objective
Deliver a production-minded React frontend that includes a public product landing page and a complete API-backed analytics workspace. The backend is authoritative; visuals must never outrank data correctness.

## Decision tree
1. **Does a frontend already exist?** Inspect it. Preserve good architecture and reuse existing choices. If no frontend exists, bootstrap Vite + React + TypeScript.
2. **Is the backend running?** Query `GET /openapi.json` and `GET /api/v1/health`. If unavailable, build typed integrations from `docs/API_INTEGRATION_CONTRACT.md`, then create clear unavailable/error states. Do not add mock production data.
3. **Does an endpoint support the desired visualization?** Use the real endpoint and inspect its payload. If the source does not include the right variables, choose a different visualization. Never fabricate missing fields or geography.
4. **Is a feature unsupported by the API?** Do not simulate server persistence. Either omit it or explicitly label it as local-only preference.
5. **Can the user perform the action with keyboard and screen reader?** If not, fix it before shipping.

## Required workflow
### Phase A — reconnaissance and plan
- Inspect all files, package manager, build setup, existing routes and styles.
- Read the API contract and design system docs.
- Inspect FastAPI source and OpenAPI when available. Confirm actual methods, paths, request fields, query parameters and JSON shapes.
- Write a concise implementation checklist and dependency plan before large edits.

### Phase B — foundation
- Configure typed environment variables, a centralized API client, consistent normalized errors, query client and route tree.
- Create design tokens and shared primitives: button, card, badge, tooltip, chart shell, page heading, KPI card, skeleton, empty state, error state, status indicator, data table and pagination.
- Make layout responsive, with an accessible collapsible sidebar on the dashboard and a mobile navigation alternative.

### Phase C — public product experience
- Build top navigation, restrained hero section, clear CTA, features, how-it-works workflow, explainability section, API-backed data preview/status, final CTA and footer.
- Avoid made-up partner logos, review quotes, adoption numbers, accuracy guarantees or customer success claims.
- If the API is down, the landing page remains readable, but live stats must show a connection status rather than fabricated figures.

### Phase D — dashboard shell and API pages
Implement the routes and features from `docs/ROUTES_AND_ACCEPTANCE.md`. Connect page data through reusable service functions and TanStack Query hooks. Each API-backed screen needs loading, retry, empty, error and success states.

### Phase E — visualizations and domain correctness
- Use Recharts/shadcn chart components where a chart adds value. Provide readable axes, units, helpful tooltips and responsive containers with explicit heights.
- Use a confusion-matrix grid for matrix data; a line plot for ROC and precision-recall curves; model comparison bars for actual model metrics; category bars for contract/payment/service/tenure; and an actual-record scatter/risk landscape when useful.
- Inspect the response shape of each chart endpoint independently. The `customer-distribution` endpoint returns a `charts` map, while most chart endpoints return `chart_type`, `x_key`, `series`, `data` and `meta`.
- Never use an area/line time-series chart to imply historical churn over time: the Kaggle dataset has no true event timestamp.
- The provided dataset has no geospatial fields. Do not create a map. Build a tenure-versus-monthly-charges risk landscape from actual eligible customer predictions instead.
- Local explanations are “single-feature baseline perturbation,” not SHAP. Reflect the backend's `method`, `contribution_scale`, `direction`, `interpretation_note` and `status` accurately.

### Phase F — mutations and user flows
- Individual prediction: validate all required fields, call `POST /predictions`, display score/threshold/category/explanation, and refresh prediction history/overview queries that depend on saved prediction count.
- Batch prediction: upload CSV as multipart form field named exactly `file`; show per-row successes and errors; render the returned `download_url` using the API origin; support downloading the CSV.
- What-if: send a complete validated `customer` object plus 1–10 scenarios, each with a `name` and `changes`; display baseline and each result, exact probability difference and non-causal disclaimer.
- Customer list: use API pagination, allowlisted filters/sorting and debounced search; exclude historical churners from default eligible risk candidates because the backend does this.
- History: use actual `created_at` and saved prediction data, never the target `Churn` as an outcome for new prediction submissions.

### Phase G — verification
- Run formatter/linter, TypeScript type check, unit tests and production build.
- Smoke-test every endpoint used by the UI against backend OpenAPI and actual response payloads when possible.
- Test a missing backend, missing dataset/model, empty chart, failed prediction, invalid CSV, partial batch errors, 404 customer, 409 ineligible customer and narrow-screen layouts.
- Verify keyboard navigation, visible focus, contrast, reduced-motion preferences and chart accessible labels.
- Search the code for placeholder values and remove all demo data from runtime paths.
- Summarize exact routes, commands run, tests passed/failed, and remaining limitations.

## Code standards
- TypeScript strict mode; keep API DTOs under `src/types/api.ts` or an equivalent focused structure.
- Separate `api/client`, `api/services`, `hooks/queries`, route pages, domain components and shared UI components.
- Use schema-based validation (Zod with React Hook Form is recommended) for prediction and what-if forms.
- Do not build giant all-in-one components. Use named functions, readable variable names and short helper functions.
- Use query keys with stable identifiers and invalidate them after writes. Avoid parallel duplicate requests for the same query.
- Never catch an error and silently return fake successful data.
- Do not add a map library, chart library or UI library unless it is used meaningfully.
