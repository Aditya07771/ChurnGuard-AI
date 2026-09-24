# ChurnGuard AI Frontend — API Integration Contract

**Source of truth:** the existing FastAPI backend under `ChurnGuard-AI-Backend`. This contract was written from the backend route modules and service/schema code. When available, confirm every final detail against `GET http://127.0.0.1:8000/openapi.json` and actual responses. Never guess a response shape if it differs.

## 1. Base URLs and environment

Create a `.env.example` in the frontend:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Read it once in the API-client module. Do not concatenate `/api/v1` again in individual services. Validate the value at startup and show a helpful connection status if it is missing or unreachable. Keep the API origin separately available when resolving relative batch download paths.

Backend developer URLs:

- API docs: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`
- Health: `GET /api/v1/health`

The backend defaults to CORS origin `http://localhost:5173`. If the frontend runs on a different origin, add that exact origin to backend `CORS_ORIGINS`; do not use wildcard CORS with credentials.

## 2. Error and request conventions

The backend has a global error envelope for most FastAPI exceptions:

```json
{
  "error": {
    "code": "MODEL_UNAVAILABLE",
    "message": "Human-readable message",
    "details": []
  }
}
```

Some standard validation responses or unexpected framework errors may not have exactly the same shape. Build one error normalizer that accepts `error`, `detail`, `message` and status code, preserves field-level validation errors when present, and returns safe user-facing text. Never show stack traces.

Common status codes:

- `400`: invalid query/sort value, invalid batch ID, malformed CSV.
- `404`: unknown customer, history record or batch export.
- `409`: a historical churner is not eligible for the default active-risk prediction endpoint.
- `413`: upload too large or too many batch rows.
- `415`: upload is not a CSV file.
- `422`: input or CSV schema/row validation issue.
- `503`: the dataset or model is unavailable.

Use abort signals/timeouts where appropriate. Do not silently turn failures into empty successful data. A chart with no data is different from an endpoint failure.

## 3. Health, metadata and overview

| Method | Path | Use |
|---|---|---|
| GET | `/health` | API, dataset, model and database readiness; show degraded state if required assets are missing. |
| GET | `/metadata` | App, dataset and model metadata, counts, fingerprint and timestamps. |
| GET | `/overview` | Main dashboard KPIs, historical labels, active-customer risks, model metrics and saved-prediction count. |

`/overview` contains separate `historical`, `active_customer_risk`, `model`, `prediction_history`, `dataset` and `generated_at` objects. Keep **actual historical churn** visually distinct from **model-predicted risk**. `risk_weighted_monthly_charges_estimate` is a prioritization estimate, not guaranteed loss or causal revenue impact.

## 4. Dataset explorer

| Method | Path | Query / output |
|---|---|---|
| GET | `/dataset/summary` | Dataset dimensions, columns, target distribution, cleaning report and fingerprint. |
| GET | `/dataset/preview` | `limit` 1–100 (default 20), `offset` ≥0 (default 0), optional `sort_by`, `sort_order=asc\|desc`; returns `pagination`, `data`, and `dataset_version`. |
| GET | `/dataset/profile` | Numerical summaries and categorical summaries. |
| GET | `/dataset/missing-values` | Missing counts and percentages, before/after cleaning report. |

Do not download the whole dataset to the browser; use the bounded preview endpoint. Sorting must use the backend's allowlisted column values. The true target column is `Churn`; never use it as a new prediction input.

## 5. Analytics endpoints

All paths below are prefixed by `/api/v1`.

| Method | Path | Recommended UI |
|---|---|---|
| GET | `/analytics/churn-by-contract` | Contract comparison bars with counts and actual churn rate. |
| GET | `/analytics/churn-by-tenure` | Ordered tenure-band comparisons; not a time-series chart. |
| GET | `/analytics/churn-by-payment-method` | Payment-method churn-rate bar chart. |
| GET | `/analytics/churn-by-internet-service` | Internet-service category comparison. |
| GET | `/analytics/churn-by-service` | Service/category matrix or filterable comparison chart; inspect both `service` and `category` fields. |
| GET | `/analytics/charges-distribution` | Charge band distribution; also includes churn-group summaries and active-risk-by-charge bands when available. |
| GET | `/analytics/churn-by-demographics` | Descriptive subgroup comparison; display respectful aggregate context and avoid causal language. |
| GET | `/analytics/tenure-distribution` | Tenure distribution. |
| GET | `/analytics/customer-distribution` | Multiple charts under `charts` (including churn, contract, payment method, internet service and gender). |
| GET | `/analytics/risk-distribution` | Risk-band distribution among historically retained eligible customers; may return `status: unavailable`. |
| GET | `/analytics/feature-importance` | Global permutation importance, method and interpretation notes; may be unavailable. |
| GET | `/analytics/model-comparison` | Candidate-model comparison and selected-model/criterion metadata. |
| GET | `/analytics/confusion-matrix` | Holdout confusion matrix. Render a labelled matrix/heatmap and preserve actual counts. |
| GET | `/analytics/roc-curve` | Holdout ROC coordinates. Render only when available. |
| GET | `/analytics/precision-recall-curve` | Holdout precision-recall coordinates. Render only when available. |
| GET | `/analytics/threshold-comparison` | Holdout threshold diagnostics and cautionary note. |

### Common chart shape

Many chart endpoints return this structure:

```json
{
  "chart_type": "bar",
  "title": "Endpoint-provided title",
  "x_key": "contract",
  "series": [{ "key": "churn_rate", "label": "Historical churn rate" }],
  "data": [],
  "meta": { "source": "historical_dataset", "dataset_version": "..." }
}
```

The object above is a schema illustration, not real data. Treat `chart_type`, `x_key`, `series`, `data` and `meta` as API-driven. `customer-distribution` is different: it returns `{ charts: { ... }, dataset_version }`. The model curves and unavailable responses have their own structures. Define a type per response family; avoid forcing every analytics response into one type.

Chart cautions:

- Historical churn endpoints describe the static dataset, not changes over calendar time.
- Global feature importance is not a single-customer explanation.
- Holdout metrics are an offline evaluation snapshot, not guaranteed production performance.
- Some endpoints may work while the model is unavailable; feature-importance/risk/model routes can be unavailable independently.

## 6. Customers and risk explorer

| Method | Path | Query/behavior |
|---|---|---|
| GET | `/customers` | `limit` 1–100; `offset`; `search`; `risk_category` Low/Medium/High; `contract`; `min_tenure`; `max_tenure`; `min_monthly_charges`; `max_monthly_charges`; `internet_service`; `payment_method`; `min_probability`; `max_probability`; `sort_by`; `sort_order=asc\|desc`. Returns `pagination` and `data`. |
| GET | `/customers/{customer_id}` | Historical customer profile and actual target status; eligible retained records can contain a `prediction` object. Returns 404 for an unknown ID. |
| GET | `/customers/{customer_id}/prediction` | Prediction for an eligible historical retained customer. Historical churners return 409 by design. |

The customer listing is based on records with historical `Churn = No`; it is the eligible active-customer risk candidate set. The dataset remains historical benchmark data, so do not imply the list is a live telecom customer database.

Allowed `sort_by` values are `churn_probability`, `tenure`, `MonthlyCharges`, `Contract`, `customerID`, and `risk_category`. Match field names exactly when submitting query parameters.

## 7. Single prediction

### Endpoint

`POST /predictions` with JSON containing the model's feature fields only.

### Request example

```json
{
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "No",
  "tenure": 12,
  "PhoneService": "Yes",
  "MultipleLines": "No",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No",
  "OnlineBackup": "Yes",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "Yes",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 79.85,
  "TotalCharges": 958.2
}
```

This is only an example valid-shaped request; do not hardcode its prediction or results into the app. `TotalCharges` may be `null`. The required features are `gender`, `SeniorCitizen`, `Partner`, `Dependents`, `tenure`, `PhoneService`, `MultipleLines`, `InternetService`, `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`, `Contract`, `PaperlessBilling`, `PaymentMethod`, `MonthlyCharges` and `TotalCharges`. `customerID` and `Churn` are deliberately not allowed as prediction features.

The response fields include:

- `churn_probability` (0–1 float; multiply by 100 only for display as percent).
- `predicted_churn` (`Yes`/`No`, based on a separate binary threshold).
- `risk_category` (`Low`/`Medium`/`High`).
- `thresholds` (actual active settings returned by API).
- `model_name`, `model_version`, `prediction_id`, `generated_at`.
- `explanation` with `status`, `method`, `top_features`, and interpretation notes where available.

The current local explanation method is **single-feature baseline perturbation**, not SHAP. Show each `contribution`, `direction`, value/baseline where returned, and its scale from the actual response. Do not relabel it SHAP or claim causality. Show a graceful unavailable state if explanation calculation is unavailable.

## 8. Batch CSV scoring

| Method | Path | Details |
|---|---|---|
| POST | `/predictions/batch` | `multipart/form-data`, field name exactly `file`; CSV upload. |
| GET | `/predictions/batch/{batch_id}/download` | Downloads server-generated CSV by batch UUID. |

Backend default limits are 5,000 rows and 10 MB, configured server-side. Validate file extension/client-side size for UX, but let server validation remain authoritative. Required feature columns must be present. If a `Churn` column is included, the backend ignores it as a predictor and reports `target_column_ignored`; explain this safely. A successful request returns `batch_id`, `total_rows`, `successful_rows`, `failed_rows`, `results`, `errors`, `download_url`, and `generated_at`.

Handle partial row errors—do not treat a partially successful response as total failure. Resolve `download_url` against the backend origin if it is relative, then download the file or open it in the browser. Never build a link from an untrusted arbitrary host.

## 9. Prediction history

| Method | Path | Query/behavior |
|---|---|---|
| GET | `/predictions/history` | `limit` 1–100, `offset` ≥0, optional `risk_category`; returns `pagination` and `data`. |
| GET | `/predictions/history/{prediction_id}` | One saved prediction record, including `input_snapshot`. |

Records include `id`, `created_at`, optional `customer_id`, probability, class, risk category, model version and explanation summary. Detail adds `input_snapshot`. New predictions do not have a known future actual outcome; do not present the model label as actual customer churn.

Invalidate/refetch overview and history after successful prediction or scenario/batch operations where relevant. Avoid polling the full history continuously.

## 10. What-if analysis

`POST /scenarios/what-if` with a complete `customer` feature object and one to ten named scenarios:

```json
{
  "customer": { "gender": "Female", "SeniorCitizen": 0, "Partner": "Yes", "Dependents": "No", "tenure": 12, "PhoneService": "Yes", "MultipleLines": "No", "InternetService": "Fiber optic", "OnlineSecurity": "No", "OnlineBackup": "Yes", "DeviceProtection": "No", "TechSupport": "No", "StreamingTV": "Yes", "StreamingMovies": "No", "Contract": "Month-to-month", "PaperlessBilling": "Yes", "PaymentMethod": "Electronic check", "MonthlyCharges": 79.85, "TotalCharges": 958.2 },
  "scenarios": [
    { "name": "Annual contract scenario", "changes": { "Contract": "One year" } },
    { "name": "Support service scenario", "changes": { "TechSupport": "Yes" } }
  ]
}
```

The response contains `baseline`, `scenarios`, `model_version`, `generated_at` and `note`. Each scenario includes changed fields, adjusted probability, predicted class, risk category, `absolute_probability_difference`, and an interpretation note. The difference is signed (`scenario probability - baseline probability`), even though its field name includes “absolute”; preserve the backend value and label it clearly as the probability-point difference. The API saves scenario metadata. These are hypothetical scores from the same fitted model and do not prove a real-world intervention would cause churn to change.

## 11. Model endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/model/status` | Model availability, name/version, train timestamp, evaluation metrics and artifact status. |
| GET | `/model/metrics` | Selected model metrics, classification report and evaluation description. |
| GET | `/model/comparison` | Candidate comparison and selected model. |

Do not expose training/retraining controls; the backend intentionally uses CLI for training. This endpoint group is read-only.

## 12. Freshness and real-time expectations

- Fetch current API data when a page/query mounts. Show `generated_at`, `loaded_at`, `trained_at` or `created_at` only when the corresponding API returns them.
- A modest 30–60 second background refresh is appropriate for health/metadata and, if desired, overview while the dashboard is open. Use TanStack Query and stop or reduce polling when the tab is hidden.
- The dataset itself is a static Kaggle snapshot. Do not use WebSockets or labels such as “live feed.”
- After mutation success, invalidate precisely the affected query keys: overview if saved prediction count changes; prediction history; single prediction result; current customer list only if appropriate; scenario UI; and batch results.
- Avoid expensive repeat requests: cache dashboard analytics, do not re-fetch all analytics for every small UI action, and do not request local explanation calculations for every customer in a list.

## 13. Map decision

The Telco dataset only contains customer/service/billing/demographic attributes and a customer identifier. It does not contain spatial coordinates, addresses, city, state or region. There is no legitimate geographic map endpoint. Do **not** add Leaflet/Mapbox/Google Maps or fabricate dots/pins. The visually rich alternative is a customer-risk scatter plot using actual eligible customer records and actual fields such as `tenure`, `MonthlyCharges`, `churn_probability` and `risk_category` (provided by `/customers`). Clearly label this visualization as a customer risk landscape, not geography.
