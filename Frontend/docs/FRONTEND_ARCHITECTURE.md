# Suggested Frontend Architecture

Use this architecture if the frontend is greenfield. If the workspace already has a clean equivalent, preserve it and adapt the names rather than restructuring everything.

## Suggested stack

- Vite + React + TypeScript (strict mode)
- Tailwind CSS and shadcn/ui for composable accessible UI primitives
- React Router for public and nested dashboard routes
- TanStack Query for server state, caching, background refresh and query invalidation
- Recharts / shadcn chart components for charting
- lucide-react for interface icons
- React Hook Form + Zod for complex prediction and scenario forms
- Vitest + React Testing Library for unit/component tests; Playwright if browser automation is available

Do not blindly upgrade packages or install overlapping component/chart libraries. Use the supported version set available in the existing project and official docs.

## Suggested directory layout

```text
ChurnGuard-AI-Frontend/
├── AGENTS.md
├── AGENT.md
├── PROMPTS.md
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── api/
│   │   ├── client.ts             # Base URL, timeout, errors, typed request helpers
│   │   ├── health.service.ts
│   │   ├── overview.service.ts
│   │   ├── dataset.service.ts
│   │   ├── analytics.service.ts
│   │   ├── customers.service.ts
│   │   ├── predictions.service.ts
│   │   ├── scenarios.service.ts
│   │   └── model.service.ts
│   ├── hooks/
│   │   ├── queries/              # TanStack Query hooks per domain
│   │   └── mutations/
│   ├── types/
│   │   └── api.ts                # DTOs/types aligned to actual OpenAPI
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── layout/               # sidebar, header, breadcrumbs, nav
│   │   ├── charts/               # reusable chart shells and domain charts
│   │   ├── data-display/         # KPI, tables, badges, pagination
│   │   └── feedback/             # loading, error, empty, unavailable states
│   ├── features/
│   │   ├── landing/
│   │   ├── overview/
│   │   ├── customers/
│   │   ├── prediction-studio/
│   │   ├── scenarios/
│   │   ├── batch-scoring/
│   │   ├── analytics/
│   │   ├── model-lab/
│   │   ├── dataset-explorer/
│   │   └── prediction-history/
│   ├── pages/                   # Route-level composition only
│   ├── lib/                     # Formatting, validation, utilities
│   └── styles/
│       └── globals.css
├── tests/
├── docs/
└── README.md
```

This is an example, not a requirement to split every file. Avoid empty modules. Organize around cohesive domains.

## Data flow

1. Route page uses a typed TanStack Query hook.
2. Hook calls a domain service.
3. Domain service uses centralized `api/client.ts`.
4. Client adds the configured API base, abort/timeout behavior, parses JSON, normalizes failures and preserves backend status/code/details.
5. Domain response types describe the real response. Runtime checks or Zod schemas may validate critical responses.
6. UI components receive typed data and render success/loading/error/empty states.
7. Mutation success invalidates only related query keys; avoid reloading the full application.

## Query policy

- Use stable keys such as `['overview']`, `['health']`, `['dataset', 'summary']`, `['analytics', 'churn-by-contract']`, `['customers', filters]`, `['prediction-history', filters]`, `['model', 'comparison']`.
- Include filter/page parameters in query keys.
- Stale times should be longer for static dataset analytics (e.g. 1–5 minutes) and shorter for health/history. The actual data is static except application history and user-triggered computations.
- Optional polling of health/metadata and overview may run every 30–60 seconds while the tab is visible. Avoid aggressive polling or all-endpoint refetch loops.
- Invalidate overview/history after saved predictions; refresh current results after a what-if or batch operation where UI state depends on it.

## API client recommendations

- `VITE_API_BASE_URL` default: `http://127.0.0.1:8000/api/v1`.
- Provide `getJson`, `postJson`, and `postForm` wrappers (or a typed fetch wrapper).
- For batch uploads, use `FormData` with field `file`. Do not manually set a multipart `Content-Type` boundary.
- Normalized API errors should contain `status`, optional `code`, `message`, optional field errors and safe original metadata needed to display useful feedback.
- Do not log customer profiles, API secrets or full input snapshots to console in production.
- Make download URL resolution explicit and restrict relative URLs to the configured API origin.

## Routing skeleton

- `/` public landing page.
- `/dashboard` redirect to `/dashboard/overview`.
- Nested dashboard pages listed in `ROUTES_AND_ACCEPTANCE.md`.
- Add a not-found page and a route-level error boundary.
- No login route: the backend has no authentication API. Do not create fake authentication.

## Testing

- API unit tests for URL construction and error normalization.
- Hook/component tests for loading, empty, error and populated states.
- Form tests for validation and mutation success/failure.
- Browser smoke tests for landing, dashboard, all pages, file upload, prediction and what-if when possible.
- Run typecheck, lint, test and production build before completion.
