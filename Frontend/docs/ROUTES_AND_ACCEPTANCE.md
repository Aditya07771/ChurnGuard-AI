# Frontend Routes and Definition of Done

## Route map

| Route | Page | Must integrate |
|---|---|---|
| `/` | Public landing | Health, metadata, overview where available; feature story, hero, How It Works, footer; CTA to dashboard. |
| `/dashboard` | Redirect | Redirect to `/dashboard/overview`. |
| `/dashboard/overview` | Executive overview | `/overview`, `/health`, `/metadata`, contract/tenure/customer/risk distribution analytics, recent `/predictions/history`. |
| `/dashboard/customers` | Risk Explorer | `/customers` paginated/filterable; risk filters and customer search. |
| `/dashboard/customers/:customerId` | Customer detail | `/customers/{customer_id}` and, when eligible, `/customers/{customer_id}/prediction`. Show historical label separate from model scores; handle 404/409. |
| `/dashboard/predict` | Prediction Studio | `POST /predictions`; real risk result, thresholds and local explanation. |
| `/dashboard/scenarios` | What-if Lab | `POST /scenarios/what-if`; baseline and one or more named scenarios. |
| `/dashboard/batch` | Batch Scoring | `POST /predictions/batch`, GET download URL; per-row errors and result export. |
| `/dashboard/analytics` | Analytics Studio | All relevant `/analytics/*` endpoints; category, billing, service, tenure and risk sections. |
| `/dashboard/model-lab` | Model Lab | `/model/status`, `/model/metrics`, `/model/comparison`, confusion matrix, ROC, precision-recall, threshold comparison and feature importance. |
| `/dashboard/dataset` | Dataset Explorer | `/dataset/summary`, `/dataset/preview`, `/dataset/profile`, `/dataset/missing-values`. |
| `/dashboard/history` | Prediction History | `/predictions/history`, `/predictions/history/{prediction_id}`. |
| `/dashboard/system` | System Status & Preferences | `/health`, `/metadata`, `/model/status`; local-only display/theme preferences if implemented. |
| `*` | Not Found | Useful recovery link to overview, no dead screen. |

A page may reuse cached results from another route, but every relevant endpoint in the API contract must be integrated into an appropriate UI, not merely fetched and discarded. The dashboard need not call every endpoint on the initial overview page; load detailed endpoints when the user navigates to the page where they are useful.

## Main user flows

### Flow A — first visit
1. User lands on `/` and understands the product in one viewport.
2. Health-aware preview reflects backend/dataset/model readiness; no made-up values.
3. User follows CTA to dashboard overview.
4. If backend/model unavailable, user sees an actionable explanation and developer setup steps, not broken cards.

### Flow B — understand the data
1. Open Dataset Explorer and inspect dimensions, target distribution, missing values and preview table.
2. Open Analytics and compare historical churn by contract, tenure, payment and service.
3. Open Model Lab and examine candidate metrics, holdout curves and feature importance.

### Flow C — score an individual customer
1. Complete the validated customer profile.
2. Submit the request to `POST /predictions`.
3. Read probability (0–1), binary prediction, low/medium/high risk band, active thresholds and model version.
4. Read explanation status/method and real feature contributions.
5. Confirm saved result appears in Prediction History and dependent overview counts refresh.

### Flow D — explore a scenario
1. Establish a complete baseline customer profile.
2. Name 1–10 scenarios and choose field changes.
3. Submit exact schema to `/scenarios/what-if`.
4. Compare baseline and scenario risk/probability and show the non-causal caution.

### Flow E — score a batch
1. Select a CSV, see filename/size and required fields.
2. Upload as multipart `file` to `/predictions/batch`.
3. Review successful/failed counts and row-level errors.
4. Download the backend-generated report.

## Acceptance checklist

### API correctness
- [ ] Base URL comes from `VITE_API_BASE_URL` and can be changed without code edits.
- [ ] Every path/method matches OpenAPI and actual backend source.
- [ ] Every API endpoint listed in `API_INTEGRATION_CONTRACT.md` is used by a relevant page/component.
- [ ] No hardcoded demo data, sample predictions, invented metrics or fake history exists in runtime components.
- [ ] Error normalizer handles both expected custom JSON errors and validation/HTTP error shapes.
- [ ] `503` states for absent dataset/model are actionable.
- [ ] POST prediction does not include `customerID` or `Churn`.
- [ ] Batch uses `FormData` field `file` and handles partial errors.
- [ ] What-if payload shape and returned signed probability difference are preserved accurately.
- [ ] Query cache updates after successful writes without stale “recent predictions” and overview counts.

### Design quality
- [ ] Landing page includes navbar, hero, product preview, feature section, how-it-works section, explainability/trust notes, CTA and footer.
- [ ] Dashboard has coherent sidebar/topbar, breadcrumbs, status indicator, responsive content grid and consistent spacing.
- [ ] Every planned dashboard route works by clicking through the UI.
- [ ] All charts use actual returned values, correct labels/units, meaningful tooltips and empty/unavailable states.
- [ ] No location map or invented time-series is present.
- [ ] Risk colors are paired with labels and accessible text contrast.
- [ ] User can navigate via keyboard; focus is visible; forms have proper labels/errors.
- [ ] Mobile layout at 320–375px has no page-level horizontal overflow; table overflow is contained.
- [ ] No dead buttons, decorative controls with no effect, broken links or console exceptions.

### Code quality and final verification
- [ ] TypeScript check passes.
- [ ] Linter passes.
- [ ] Unit/component tests pass.
- [ ] Production build passes.
- [ ] Smoke test confirms navigation and primary prediction flow.
- [ ] Tests include backend-down/error/empty cases, not only populated success cases.
- [ ] README documents install, API base URL, backend startup, frontend startup, tests and known limitations.
- [ ] Final agent report lists the real commands run and actual pass/fail results.
