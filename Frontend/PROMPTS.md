# Antigravity Prompts — ChurnGuard AI Frontend

Use these prompts inside Antigravity with the frontend workspace open. The pack is designed for end-to-end implementation, not only planning.

## Master Prompt — paste this first

```text
You are the lead product designer, senior React + TypeScript engineer, frontend architect, data-visualization specialist, accessibility reviewer, and QA engineer building the COMPLETE FRONTEND for ChurnGuard AI — Explainable Customer Churn Prediction & Retention Intelligence.

CONTEXT
- We already have a functioning FastAPI + ML backend in a separate folder/repository. Do NOT rebuild the backend and do NOT overwrite it.
- Backend base URL by default: http://127.0.0.1:8000/api/v1
- Backend Swagger: http://127.0.0.1:8000/docs
- Backend OpenAPI: http://127.0.0.1:8000/openapi.json
- Read AGENTS.md, .agents/skills/churnguard-frontend/SKILL.md, docs/API_INTEGRATION_CONTRACT.md, docs/DESIGN_SYSTEM_AND_UX.md, docs/FRONTEND_ARCHITECTURE.md and docs/ROUTES_AND_ACCEPTANCE.md before implementation.
- The exact backend API contract and real returned values are the source of truth. Inspect OpenAPI/backend source when available.

MISSION
Build a complete, polished, aesthetic and responsive frontend that contains BOTH a public landing page and a comprehensive interactive dashboard. Every dashboard view must be wired to real backend APIs. Make it attractive enough for a college project demo but credible as a serious analytics product. Do actual coding, run the app, test it, fix errors and finish the integration. Do not stop after generating a plan or a visual mockup.

STARTUP PROTOCOL
1. Inspect the entire workspace, package manager, current frontend (if any), backend folder if accessible, route modules, API schemas, .env files (never expose secrets) and OpenAPI document. Preserve good existing code.
2. Write a short checklist and then implement immediately. If no frontend exists, use Vite + React + TypeScript strict mode. Use existing project choices if already good.
3. Use a focused stack: Tailwind CSS + shadcn/ui, React Router, TanStack Query, Recharts/shadcn chart components, lucide-react, React Hook Form + Zod, and a test framework appropriate to the project. Do not install overlapping UI/chart libraries without reason.
4. Add VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1 to .env.example. Centralize API requests, typed response models, error normalization, query keys and query invalidation.
5. Implement the route map in docs/ROUTES_AND_ACCEPTANCE.md and every applicable endpoint in docs/API_INTEGRATION_CONTRACT.md.
6. Run format/lint, TypeScript checks, tests, production build and realistic route/API smoke tests. Fix failures before final response.

VISUAL DIRECTION — DO NOT MAKE A GENERIC ADMIN TEMPLATE
Create a refined “Signal, not noise” visual system. Landing page: midnight/navy hero, restrained teal/indigo atmospheric accents, sharp typography, concise copy, a realistic product preview, high-quality navbar and clear CTA. Dashboard: light neutral canvas, deep ink collapsible sidebar, clean white surfaces, quiet borders, crisp typography, consistent spacing, strong KPI cards, careful micro-interactions, premium chart surfaces and polished skeleton/empty/error states. Provide a complete optional dark theme only if it is fully tested. Avoid overused glassmorphism, loud gradients everywhere, emoji icons, clutter, tiny labels and gratuitous animations.
Use the design tokens and exact page instructions in docs/DESIGN_SYSTEM_AND_UX.md. Audit contrast and keyboard focus, not just appearance. Use labels and shapes alongside risk colors.

PUBLIC LANDING PAGE `/`
Include:
- Responsive navbar with brand, meaningful anchor navigation and a prominent “Open Dashboard” CTA.
- Hero headline around “See churn risk clearly. Decide what to do next.”, concise product value proposition and primary/secondary actions.
- A product preview powered by genuine backend data when connected. If the backend is unavailable, show a good-designed connection status instead of invented KPI figures.
- Feature sections explaining dataset exploration, model evaluation, local explainability, active customer risk and what-if/batch workflows.
- A clear “How it works” four-step process: inspect historical data → compare ML models → score and explain a customer → explore scenarios/export results.
- Explainability/trust note, final CTA and polished footer.
- Do not invent customer testimonials, partner logos, company usage counts, savings, accuracy guarantees or case-study numbers.

DASHBOARD ROUTES
Implement at minimum:
- /dashboard → redirect to /dashboard/overview
- /dashboard/overview
- /dashboard/customers
- /dashboard/customers/:customerId
- /dashboard/predict
- /dashboard/scenarios
- /dashboard/batch
- /dashboard/analytics
- /dashboard/model-lab
- /dashboard/dataset
- /dashboard/history
- /dashboard/system
- a custom not-found page
Use a collapsible sidebar with grouped navigation, a responsive mobile drawer, page title/breadcrumbs, API/model status and a meaningful refresh control. No fake signed-in user because backend auth is not implemented.

API INTEGRATION — ALL ROUTES
Implement the API contract described in docs/API_INTEGRATION_CONTRACT.md, matching real method/path/request/query/response types. Do not merely issue requests and ignore results. Integrate every endpoint on a suitable page; lazy-load detailed analytics only when needed. Use TanStack Query keys containing filters/pagination, sane stale times, modest optional 30–60 second health/overview refresh only while visible, and precise invalidation after prediction/batch/scenario mutations. Handle 400/404/409/413/415/422/503 with a consistent and accessible explanation. Implement loading, refreshing, empty, unavailable, partial success, retry and failure states.
The single prediction form must send only the actual feature fields and must not send customerID or Churn. Batch upload must use multipart field name `file` and support partial row errors and the returned downloadable CSV. What-if must send a complete customer profile plus named scenarios and must preserve server-returned probability differences and the non-causal caveat. Read `explanation.method` from the API: current local explanation is single-feature baseline perturbation, not SHAP.

DASHBOARD CONTENT
Overview: true historical customers/churn rate; eligible actively scored customer count; High/Medium/Low risk counts; mean predicted probability; risk-weighted monthly-charge estimate with its caveat; actual selected model and holdout metrics; contract churn, tenure churn, risk distribution, customer distribution and recent saved predictions. Distinguish actual historical label data from model estimates.
Risk Explorer: server-side paginated/sortable/filterable/searchable customer table using `/customers`, risk bands, probability, contract, tenure, charges, internet service and payment method; customer detail and sensible 404/409 states.
Prediction Studio: grouped accessible form, validation, prediction probability and class, threshold markers, risk band, model version and genuine feature contributions.
What-if Lab: baseline and up to 10 named variants; compare probabilities, risk band and changed fields; show hypothetical/non-causal notice.
Batch Scoring: CSV upload, row-level valid/error results, counts and download.
Analytics Studio: historical churn by contract/tenure/payment/internet/service/demographics; charge/tenure/customer/risk distributions; tooltips include counts/rates where returned.
Model Lab: candidate model comparisons, model selection criterion, confusion matrix, ROC curve, precision-recall curve, threshold diagnostics, global permutation feature importance and evaluation caveat.
Dataset Explorer: dataset metadata, summary, data preview, schema, profiles, missing values and cleaning report.
Prediction History: true saved timestamps and IDs, risk filter, detail input snapshot, clear empty state; never infer future outcome for a submitted customer.
System page: live API/model/dataset readiness and configuration guidance; no fake retrain button or unimplemented server preferences.

DATA HONESTY REQUIREMENTS
This Kaggle dataset is a static historical snapshot, without event timestamps, geographic coordinates or addresses. NEVER create a fake churn-over-time chart or geographic map. The user's request mentions a map, but the data cannot support a real map. Instead create a rich “Customer Risk Landscape” scatter plot from real eligible customer records: tenure on X, monthly charges on Y, and actual API-returned probability/risk category as a clearly labelled visual encoding. Paginate truthfully and do not imply a current live telecom feed. Do not make up trend deltas, customers, values, feature contributions or historical prediction history. Do not say probability means certainty, feature contribution means causation, global importance explains one individual, or what-if simulation proves an intervention works.

ENGINEERING QUALITY
- Strict TypeScript, typed API DTOs, no `any` where avoidable, no giant all-in-one files.
- Centralized API client and domain service functions.
- Forms with labels and inline validation, disabled/loading pending states, duplicate-submit protection, success and field-level server errors.
- Every visible button, nav item, filter, tab, table sort, pagination, upload, download and chart affordance must function.
- Correct responsive layouts including 320–375px widths and tablet; avoid page-level horizontal overflow.
- Accessible focus, keyboard navigation, reduced-motion consideration, chart labels/accessible summaries, sufficient contrast and non-color-only risk labels.
- Never include credentials or local backend artifacts in frontend source.

VERIFICATION — MANDATORY
1. Start the frontend dev server and, when available, connect to backend health/OpenAPI.
2. Confirm all route-level links work and no page is blank.
3. Test normal data, empty data, backend offline, model/dataset unavailable, invalid form, prediction success, batch success/partial failure/invalid CSV, scenario success/failure, customer 404 and the active-customer 409 condition.
4. Run linter, typecheck, tests and production build; fix errors.
5. Inspect browser console and network requests, correct every endpoint integration mismatch and remove all demo/fake runtime data.
6. Update README with setup commands, .env configuration, backend requirements, routes and test results.
7. Provide a truthful final report: features implemented, endpoints connected, commands executed, tests/build results, and any exact limitations.

Do not ask me to confirm minor choices. Make sensible decisions from these requirements, implement the whole frontend, and only report a blocker when a genuine environment issue prevents a specific operation. Start by inspecting files, then build.
```

## Phase prompt 1 — audit and foundation

Use only if Antigravity works better in milestones:

```text
Read AGENTS.md, the frontend skill, and all docs in docs/. Inspect the existing frontend and backend/OpenAPI. Implement the frontend foundation only: app setup, environment variable, centralized typed API client, shared error handling, TanStack Query provider, route skeleton, design tokens, reusable loading/error/empty/status primitives, responsive app shell and test setup. Do not use mock data. Run install, typecheck, lint, tests and build; fix issues. Give me the exact result, then proceed to the next phase without rebuilding the backend.
```

## Phase prompt 2 — landing page and dashboard shell

```text
Continue from the real codebase. Implement the premium public landing page and the responsive dashboard shell using docs/DESIGN_SYSTEM_AND_UX.md. Include navbar, hero, feature story, how-it-works, explainability section, final CTA and footer. Build the nested dashboard navigation, page headers, breadcrumbs, sidebar/mobile drawer, status indicator and coherent responsive grids. Any numbers or status shown in the product preview must be from the backend; if disconnected, show a genuine unavailable/connect state. Make every navigation element work. Run checks and fix issues.
```

## Phase prompt 3 — connect every API endpoint

```text
Implement every applicable endpoint documented in docs/API_INTEGRATION_CONTRACT.md. Verify methods, paths, query parameters, request schemas and response types against actual backend OpenAPI/source. Integrate overview, dataset explorer, every analytics endpoint, customers and detail/prediction, single prediction, batch upload/download, history, what-if, and model metrics/comparison/curves/status. Use typed TanStack Query hooks and precise query invalidation after successful mutations. Each page must have loading, error, empty, unavailable and populated states. No hardcoded runtime data. Pay special attention to JSON shape differences across chart endpoints and to API error normalization. Run backend-connected smoke checks where possible.
```

## Phase prompt 4 — polish analytics and model UI

```text
Upgrade the dashboard to a polished ML analytics product, not a generic admin page. Add the real chart types supported by the backend: historical churn category bars, tenure bands, risk distribution, billing/charge bands, service comparisons, model metrics, confusion-matrix heatmap, ROC curve, precision-recall curve, threshold diagnostics, global permutation importance and an actual-record tenure-vs-monthly-charges risk scatter plot. Include meaningful axis labels, units, counts in tooltips, legends, empty states and concise interpretive notes. Do not invent maps, geo data or calendar churn trends; the data has no geospatial/time-series fields. Ensure the local explanation is correctly named and what-if remains non-causal. Run checks and review the UI at mobile/tablet/desktop widths.
```

## Phase prompt 5 — end-to-end QA and fix pass

```text
Act as a strict QA engineer. Review the full app against docs/ROUTES_AND_ACCEPTANCE.md and AGENTS.md. Visit every route; trigger every button, filter, sort, pagination, form, upload, export and navigation action. Test backend offline, dataset/model unavailable, validation errors, 404, 409, 413, 415, 422, 503, empty chart responses and partial batch failures. Verify API request payloads in the Network panel, remove any leftover fake/demo values, make cache invalidation work, and run typecheck/lint/tests/production build. Check contrast, visible focus, keyboard nav, responsive overflow, console errors and accessible chart summaries. Fix every issue you can. Update README with exact commands and actual results. Report only verified completion, not intent.
```

## Short emergency instruction if Antigravity starts giving only a plan

```text
Do not stop at a plan, mockup or component scaffold. Read the project files and implement the actual frontend now. Run the app, run tests and production build, inspect network/API responses, fix the resulting errors, and keep working through the acceptance checklist until every possible item is completed. Never use fake API data to hide integration failures.
```
