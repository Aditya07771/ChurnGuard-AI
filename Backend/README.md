# ChurnGuard AI — Backend

A beginner-friendly FastAPI backend for an explainable customer churn prediction and retention analytics project. It provides REST APIs for dataset exploration, customer risk scoring, model evaluation, feature-level explanations, batch CSV predictions, scenario comparison, and prediction history.

> **Important:** A churn probability is an estimate learned from historical patterns. It is not certainty, and an individual feature contribution is not proof of causation.

## What is included

- FastAPI app with Swagger at `/docs` and ReDoc at `/redoc`.
- KaggleHub dataset loader with local cache and validation.
- Cleaning for whitespace, numeric fields and blank `TotalCharges` values.
- Leakage-safe preprocessing pipeline; `customerID` and `Churn` are never model inputs.
- Four candidate models: Logistic Regression, Decision Tree, Random Forest and Gradient Boosting.
- Stratified train/test split, stratified cross-validation, holdout metrics, ROC/PR curve data, confusion matrix and permutation importance.
- Persisted preprocessing + model pipeline and model metadata.
- Single-customer and CSV batch predictions, explainability, what-if comparisons and risk segmentation.
- SQLite prediction history using SQLAlchemy.
- Offline tests that use a small deterministic fixture and do not call Kaggle.

## Project structure

```text
app/
  main.py                 FastAPI app and startup initialization
  core/                   Settings, logging and domain exceptions
  api/routes/             Thin REST route handlers
  schemas/                Pydantic request and response models
  services/               Dataset, analytics, customer and prediction logic
  ml/                     Dataset loading, preprocessing, training and inference
  database/                SQLite setup, tables and repository methods
  utils/                  Shared validation and pagination helpers
scripts/                  Download, train and score commands
tests/                    Offline unit and API tests
data/raw/                 Local dataset cache (not distributed)
data/processed/           Generated output and batch reports
artifacts/                Model pipeline and evaluation metadata
```

## Requirements

- [uv](https://docs.astral.sh/uv/getting-started/installation/) for Python and dependency management.
- Python 3.13 (selected by `.python-version`; uv can install it if it is not already available).
- Internet access for the first KaggleHub download, or a manually downloaded CSV.
- No external database server; SQLite is local.

## Windows PowerShell setup (using uv)

Install `uv` once if it is not already installed. Open PowerShell and run the official installer:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Close and reopen PowerShell if the `uv` command is not yet found. Then, from the extracted `ChurnGuard-AI-Backend` project directory, run:

```powershell
uv python install 3.13
uv sync
Copy-Item .env.example .env
uv run python -m scripts.download_dataset
uv run python -m scripts.train_model
uv run uvicorn app.main:app --reload
```

`uv sync` creates the `.venv` environment, resolves dependencies declared in `pyproject.toml`, and writes `uv.lock` for repeatable future installs; no manual environment activation or `pip install` is required. (The build environment used to create this ZIP had no access to PyPI, so the first lockfile is generated when you run `uv sync` on your machine.) The commands that start with `uv run` run inside that managed environment. The bundled model can be used without retraining; the dataset download and training commands are needed when you want to refresh the local dataset and train a new model. Keep the installed scikit-learn version aligned with the bundled model artifact. The `requirements.txt` file is retained as a compatibility option for tools that do not use uv. `pyproject.toml` is the dependency source of truth; the first successful `uv sync` creates `uv.lock`, which should be kept for later repeatable installs.

Then open:

- API root: http://127.0.0.1:8000/
- Swagger: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- Health: http://127.0.0.1:8000/api/v1/health
- Overview: http://127.0.0.1:8000/api/v1/overview

### Kaggle dataset download

The expected dataset handle is `blastchar/telco-customer-churn`. `uv run python -m scripts.download_dataset` uses KaggleHub's `dataset_load()` API first and falls back to `dataset_download()`. If the public dataset requires login/consent in your environment, follow KaggleHub's authentication steps; never commit Kaggle tokens or `.env` secrets. You can also manually download the CSV and place it at `data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv`.

The API does **not** silently invent data or train a model on startup. If the dataset or model artifacts are missing, health reports a degraded state and dependent endpoints return a clear error. To use an external CSV path, set `LOCAL_DATASET_PATH` in `.env`.

## Machine learning flow

1. Read and validate the real CSV schema and target labels.
2. Clean text whitespace and convert charge columns to numbers. The dataset's blank `TotalCharges` values for zero-tenure customers are set to `0.0`; other missing predictor values go through a training-only median/mode imputer.
3. Split stratified training/test data before fitting transformations.
4. Build preprocessing with a `ColumnTransformer`: numeric imputation/scaling and categorical imputation/one-hot encoding that tolerates unseen categories.
5. Compare four classifiers using stratified cross-validation on only the training split. The selected model is chosen by mean CV F1 for the `Yes` (churn) class, not by test accuracy.
6. Evaluate the selected model on the holdout test split and save metrics, confusion matrix, ROC curve, precision-recall curve and permutation feature importance.
7. Save the complete fitted pipeline and its metadata as local artifacts.

The bundled model was trained on 7,043 records (5,634 training and 1,409 holdout records). In this reproducible split, Logistic Regression was selected by cross-validation F1 (mean 0.629); holdout metrics were accuracy 0.738, precision 0.504, recall 0.783, F1 0.614 and ROC-AUC 0.842. The precision/recall trade-off is intentional to show churn-customer recall, and this is a static-dataset evaluation, not a guarantee of performance on future customers. The default binary decision threshold is 0.50. Risk display thresholds are independently configurable: Low `< 0.30`, Medium `0.30–<0.70`, High `>= 0.70`.

### Explainability

Local explanations use **single-feature baseline perturbation**: one field at a time is changed to its training-split median or mode, and the model probability difference is measured. This is a real model comparison, but it is not SHAP, contributions do not necessarily sum, and results are not causal. Global explanations use permutation importance scored by ROC-AUC on the holdout set.

## API catalogue

All endpoints use `/api/v1`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API, dataset, model readiness |
| GET | `/metadata` | Dataset fingerprint and model metadata |
| GET | `/overview` | Historical KPIs, active risk summary and model metrics |
| GET | `/dataset/summary` | Schema, dimensions and cleaning report |
| GET | `/dataset/preview` | Paginated, sortable preview (`limit`, `offset`, `sort_by`, `sort_order`) |
| GET | `/dataset/profile` | Numeric and categorical summaries |
| GET | `/dataset/missing-values` | Missing counts/percentages before and after cleaning |
| GET | `/analytics/churn-by-contract` | Churn by contract |
| GET | `/analytics/churn-by-tenure` | Churn by tenure bands |
| GET | `/analytics/churn-by-payment-method` | Churn by payment method |
| GET | `/analytics/churn-by-internet-service` | Churn by internet service |
| GET | `/analytics/churn-by-service` | Churn by service category |
| GET | `/analytics/churn-by-demographics` | Aggregate descriptive churn patterns by demographic/household fields |
| GET | `/analytics/charges-distribution` | Charge bands and churn counts |
| GET | `/analytics/tenure-distribution` | Tenure distribution |
| GET | `/analytics/customer-distribution` | Historical categorical distributions |
| GET | `/analytics/risk-distribution` | Predicted active-customer risk bands |
| GET | `/analytics/feature-importance` | Global permutation importance |
| GET | `/analytics/model-comparison` | Candidate metrics and selection rule |
| GET | `/analytics/confusion-matrix` | Final holdout confusion matrix |
| GET | `/analytics/roc-curve` | ROC coordinates and AUC |
| GET | `/analytics/precision-recall-curve` | Precision-recall coordinates |
| GET | `/analytics/threshold-comparison` | Diagnostic operating-threshold data |
| GET | `/customers` | Paginated/filtered active retained customers |
| GET | `/customers/{customer_id}` | Historical record and prediction if eligible |
| GET | `/customers/{customer_id}/prediction` | Prediction for active eligible record |
| POST | `/predictions` | Single profile prediction, explanation and history |
| POST | `/predictions/batch` | Validate CSV, predict valid rows, report row-level errors |
| GET | `/predictions/batch/{batch_id}/download` | Download a saved batch CSV report |
| GET | `/predictions/history` | Paginated history; optional `risk_category` |
| GET | `/predictions/history/{prediction_id}` | One stored prediction with input snapshot |
| POST | `/scenarios/what-if` | Compare baseline profile with up to ten modifications |
| GET | `/model/status` | Model availability and selected metadata |
| GET | `/model/metrics` | Holdout metrics and classification report |
| GET | `/model/comparison` | Candidate comparison |

Dataset-backed routes return HTTP 503 if the real dataset isn't loaded. Model-dependent predictions return HTTP 503 if trained artifacts aren't available. No metrics are fabricated to fill empty pages.

## Example requests

### Single prediction

```powershell
$body = @{
  gender = "Female"
  SeniorCitizen = 0
  Partner = "Yes"
  Dependents = "No"
  tenure = 12
  PhoneService = "Yes"
  MultipleLines = "No"
  InternetService = "DSL"
  OnlineSecurity = "No"
  OnlineBackup = "Yes"
  DeviceProtection = "No"
  TechSupport = "No"
  StreamingTV = "No"
  StreamingMovies = "No"
  Contract = "Month-to-month"
  PaperlessBilling = "Yes"
  PaymentMethod = "Electronic check"
  MonthlyCharges = 60.5
  TotalCharges = 726.0
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/v1/predictions -ContentType "application/json" -Body $body
```

### Overview / analytics

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/overview
Invoke-RestMethod http://127.0.0.1:8000/api/v1/analytics/churn-by-contract
Invoke-RestMethod "http://127.0.0.1:8000/api/v1/customers?limit=10&sort_by=churn_probability&sort_order=desc"
```

### Batch CSV

CSV must include all model feature columns. `customerID` is optional for matching/reporting. If a `Churn` column is present, it is ignored and is never used as a predictor. The response includes success/failure counts, row-level errors and a `download_url` for valid results.

## Frontend connection

For a React + TypeScript app using Vite, the default CORS allowlist contains `http://localhost:5173`. Change `CORS_ORIGINS` to a comma-separated list of exact frontend origins. The backend uses snake_case JSON fields.

Example:

```ts
const response = await fetch("http://127.0.0.1:8000/api/v1/overview");
if (!response.ok) throw new Error(`API failed: ${response.status}`);
const overview = await response.json();
```

## Storage and generated files

SQLite is created locally at `data/churn_guard.db`. Each successful single or batch prediction stores the input snapshot, probability, label, risk category, model version and a small explanation summary. A future verified outcome for a new prediction is not inferred from its model label. Batch CSV exports are written under `data/processed/batch_exports/` with UUID names.

## Tests

Run the offline test suite (no internet or Kaggle credentials required):

```powershell
uv run pytest -q
```

The tests build a deterministic toy dataset for test purposes only. It is never substituted for the real dataset in application mode.

## Troubleshooting

- **Dataset unavailable:** run `uv run python -m scripts.download_dataset`, or set `LOCAL_DATASET_PATH` to the CSV. Check spelling and headers.
- **KaggleHub authentication/download error:** follow https://github.com/Kaggle/kagglehub for token setup; do not commit the token.
- **Model unavailable:** run `uv run python -m scripts.train_model` after loading the real CSV.
- **Artifact version error:** use the scikit-learn version declared in `pyproject.toml` and retrain after changing model-library versions. Only load local artifacts generated by this repository.
- **Frontend CORS failure:** add the exact frontend origin to `CORS_ORIGINS`, restart Uvicorn, and check the browser request URL.
- **Unexpected category:** the encoder ignores unseen categories, while request schemas require non-empty values. Keep exact feature column names in CSV uploads.
- **Port already in use:** launch on another port, for example `uv run uvicorn app.main:app --reload --port 8001`.
