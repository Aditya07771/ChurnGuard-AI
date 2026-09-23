# ChurnGuard AI — Frontend Agent Rules

These instructions are persistent project rules for Antigravity and other coding agents working in this frontend repository.

## Mission
Build a polished, accessible, responsive React + TypeScript frontend for **ChurnGuard AI — Explainable Customer Churn Prediction & Retention Intelligence**. The existing FastAPI backend is the source of truth. Deliver working pages and API integrations, not a static mockup.

## First actions — mandatory
1. Inspect the complete frontend workspace before editing. Preserve useful existing code and conventions; do not replace a working app blindly.
2. Read `docs/API_INTEGRATION_CONTRACT.md`, `docs/DESIGN_SYSTEM_AND_UX.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/ROUTES_AND_ACCEPTANCE.md`, and the skill at `.agents/skills/churnguard-frontend/SKILL.md`.
3. If the backend repository is available as a sibling, inspect its route files and `/openapi.json`. The live OpenAPI schema and backend source take precedence over assumptions in this documentation. Do not modify backend files unless explicitly asked.
4. Implement in small phases, run type checks, lint and tests after each phase, and fix errors before continuing.

## Non-negotiable product rules
- All displayed business figures, KPIs, chart values, customer risk scores, model metrics and explanations must originate from the backend. Never hardcode plausible-looking demo data in production page components.
- Never generate fake customer records, invented prediction history, invented dates/trends, false live badges, fabricated feature contributions, or false model metrics.
- The Kaggle Telco dataset is a static snapshot. The app may refetch API data and update after user actions, but must not claim a live telecom feed or continuous streaming.
- The source dataset has no longitude, latitude, address, state, city or region fields. Do not add a geographic map or imply customer geolocation. Use an interactive risk landscape based on real fields, such as tenure versus monthly charges with risk bands, instead.
- Keep historical `Churn` labels separate from predicted churn. The historical customer-detail route may include a real label; new prediction requests must never send `Churn` or `customerID` as model features.
- Treat prediction probability as an estimate, risk categories as configurable display bands, feature contributions as model-behaviour comparisons, and what-if changes as hypothetical—not causal—results.
- Do not invent authentication, roles, server-side settings, retraining controls or persistence features that the backend does not provide. If useful, clearly label a frontend-only preference as local UI state.
- Every enabled button, link, filter, form, tab, menu, upload, pagination control, export and chart interaction must do what its label promises. No dead controls.
- Respect backend pagination and upload limits. Handle 400, 404, 409, 413, 415, 422 and 503 responses with understandable feedback.

## Engineering rules
- Use React + TypeScript with strict typing. Prefer small, composable components, typed API contracts, centralized error normalization and domain-focused query hooks.
- Use TanStack Query for server state, caching, background refetching, invalidation and mutation lifecycle. Use query keys that include the endpoint and relevant parameters. Do not fetch in arbitrary `useEffect` blocks when a query hook is appropriate.
- Build one shared API client using `import.meta.env.VITE_API_BASE_URL`; default to `http://127.0.0.1:8000/api/v1`. Do not scatter raw URLs across components.
- Read response shapes from the actual backend/OpenAPI. Avoid `any`; use `unknown` at trust boundaries and validate/normalize safely.
- Use URL query parameters for shareable filters/pagination where practical. Debounce free-text search.
- Make loading, refreshing, empty, unavailable, partial-error and retry states first-class UI states.
- If the dataset/model is unavailable, show an honest setup/status panel with actionable instructions. Never swap in mock values.
- Use the existing package manager and framework if the project already has one. If starting fresh, use Vite + React + TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Recharts and lucide-react. Keep dependencies focused.
- Use accessible semantic HTML, labels, keyboard-operable controls, visible focus, responsive layouts and WCAG 2.2 AA contrast intent. Do not rely on color alone to communicate risk.
- Use Lucide icons consistently. Do not use emoji as interface icons. Avoid decorative icon overload and unnecessary gradients/glass effects.
- Format INR/charges, percentages, dates and probability consistently. State units. Do not confuse a probability from 0–1 with a percent from 0–100.
- Chart data must be mapped from API responses and must adapt to unavailable/empty data. Each chart needs a meaningful title, accessible explanation, tooltip, units and empty state. Prefer the correct chart for the data over a chart merely because it looks impressive.
- No invented trend/sparkline for this static dataset unless it comes from actual timestamped data. Prediction history may use actual `created_at` dates if returned by the history API, but must not imply historical churn labels over time.
- Do not expose stack traces, local paths, environment secrets or raw technical failures to end users.

## Visual quality bar
Use the detailed specifications in `docs/DESIGN_SYSTEM_AND_UX.md`. The result should feel like a credible, premium analytics product: strong typographic hierarchy, deliberate whitespace, consistent grid, compact but readable charts, restrained accents, polished empty states, and coherent desktop/tablet/mobile layouts. Do not settle for a generic admin template with only the logo changed.

## Completion requirements
Before calling a phase complete:
1. Run the project typecheck, lint and tests that exist.
2. Build for production.
3. Test every route and every user-facing action that changed.
4. Inspect API Network responses to ensure values are real and endpoint paths are correct.
5. Fix console errors, React key warnings, broken links, horizontal overflow and accessibility issues.
6. Update the README with setup, backend configuration, route map, verification results and limitations.
7. Report any blocked work honestly; do not mark work complete merely because code was generated.
