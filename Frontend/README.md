# ChurnGuard AI — Frontend Documentation & Verification Report

**ChurnGuard AI** is an explainable customer churn prediction and retention intelligence platform built on React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, and Recharts, integrated with a FastAPI machine learning backend.

---

## 1. Quick Start

### Prerequisites
- Node.js 20+ / npm 10+
- Python 3.11+ (for the backend server)

### Backend Setup
From the sibling `Backend` directory:
```bash
cd Backend
# Activate your venv and run uvicorn:
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000/api/v1`
- OpenAPI Documentation: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

### Frontend Setup
From the `Frontend` directory:
```bash
cd Frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 2. Environment Variables

Create `.env` based on `.env.example`:
```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

---

## 3. Implemented Route Map

| Route | Page | Description | Key Backend Integrations |
|---|---|---|---|
| `/` | Landing Page | Public marketing page with live backend preview | `GET /health`, `GET /metadata`, `GET /overview` |
| `/dashboard/overview` | Executive Overview | Executive KPIs, charts, customer risk landscape, and audit log | `GET /overview`, `GET /analytics/*`, `GET /customers`, `GET /predictions/history` |
| `/dashboard/customers` | Risk Explorer | Filterable, sortable, paginated active customer directory | `GET /customers` (limit, offset, search, risk_category, contract, sort) |
| `/dashboard/customers/:customerId` | Customer Detail | Comprehensive demographic, service, and contract breakdown | `GET /customers/{id}`, `GET /customers/{id}/prediction` (handles 409) |
| `/dashboard/predict` | Prediction Studio | Single customer prediction with local explainability | `POST /predictions` (Zod validation, baseline perturbation bars) |
| `/dashboard/scenarios` | What-if Lab | Comparative simulation of hypothetical customer changes | `POST /scenarios/what-if` (up to 10 variants, signed deltas) |
| `/dashboard/batch` | Batch Scoring | Bulk CSV file upload and prediction downloads | `POST /predictions/batch`, `GET /predictions/batch/{id}/download` |
| `/dashboard/analytics` | Analytics Studio | Tabbed deep-dives into contracts, billing, services, and risk | `GET /analytics/churn-by-contract`, `churn-by-tenure`, etc. |
| `/dashboard/model-lab` | Model Lab | Candidate benchmarking, ROC/PR curves, confusion matrix, threshold tuning | `GET /model/status`, `/model/metrics`, `/model/comparison`, curves |
| `/dashboard/dataset` | Dataset Explorer | Bounded dataset table preview, statistical profiles, and null hygiene | `GET /dataset/summary`, `/preview`, `/profile`, `/missing-values` |
| `/dashboard/history` | Prediction History | Paginated audit trail of all previous inferences and snapshots | `GET /predictions/history`, `GET /predictions/history/{id}` |
| `/dashboard/system` | System Status | FastAPI readiness, dataset hash, model artifact details, CLI instructions | `GET /health`, `GET /metadata`, `GET /model/status` |
| `*` | Not Found | 404 recovery page | — |

---

## 4. Architectural & Data Truth Principles

1. **Zero Fake/Demo Data**: All numbers, charts, customer records, model metrics, and explanation weights originate from real backend responses.
2. **Static Snapshot Honesty**: The Kaggle Telco Customer Churn dataset is an offline historical snapshot. There are no geographic coordinates (no false maps) and no event timestamps (no fabricated churn trends over calendar time).
3. **Customer Risk Landscape**: In place of a geographic map, tenure vs. monthly charges is plotted as a 2D scatter plot from actual customer records returned by the `/customers` endpoint, colored by predicted risk band.
4. **Local Explainability Precision**: Individual predictions use **single-feature baseline perturbation**, never falsely relabeled as SHAP.
5. **Non-Causal Warnings**: What-if scenario differentials and demographic subgroup rates prominently feature disclaimers that correlation does not establish real-world causality.
6. **Graceful Error Handling**: 409 status codes (historical churners ineligible for active prediction) and 503 status codes (model/dataset unavailable) are handled with explanatory states.

---

## 5. Verification & Test Results

### Automated Unit & Component Tests
```bash
npm test
```
- **17 tests passed** across `utils.test.ts`, `api-client.test.ts`, and `components.test.tsx`.

### Linting
```bash
npm run lint
```
- **0 errors** across all TypeScript files.

### Production Build
```bash
npm run build
```
- **Compiled cleanly in ~1s** with full TypeScript verification (`tsc -b && vite build`).

---

## 6. Visual Design System

The UI uses a warm, editorial analytics identity (applied globally via CSS custom properties in `src/index.css`, so it also restyles every dashboard screen without touching business logic).

| Token | Value | Use |
|---|---|---|
| Canvas | `#F8F5EF` | Warm ivory page background |
| Surface / card | `#FFFEFC` | Cards and panels |
| Ink | `#171611` | Primary text |
| Muted ink | `#6E6A61` | Secondary text |
| Border | `#E9E2D7` | Warm hairline borders |
| Accent (primary) | `#1D6044` | Forest-green actions, selected states, links |
| Pale beige | `#F1E9D9` | Muted fills, small labels |
| Dark panel | `#15140F` | Hero preview card, final CTA |

- **Typography**: serif (`--font-serif`) for hero/section headings and large statistics; Geist Variable sans for interface text; monospace for model versions, dataset metadata and compact values.
- **Landing page** (`/`) rebuilt: warm hero with readiness chips, a dark API-backed model-overview preview card (historical churn rate, active risk distribution, model version), a three-card capability section, a forest-green workflow banner, a four-step workflow, an explainable-ML section, and a footer.
- All figures on the landing page are read from `GET /health`, `GET /metadata` and `GET /overview`. When the backend is offline the preview shows an honest "not connected" state and never substitutes sample data.
- No new dependencies were added; the serif uses a web-safe font stack.

