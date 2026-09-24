# ChurnGuard AI — Visual Design System and UX Blueprint

## 1. Product experience

**Product positioning:** Explainable customer churn prediction and retention intelligence. The frontend should translate ML into a simple operational story: understand the historical data, find segments with elevated historical churn, score eligible customer profiles, understand a prediction, compare hypothetical scenarios, and download useful reports.

**Desired impression:** Premium analytics SaaS with scientific clarity. It should feel intentional, calm, trustworthy and data-dense without looking like an overcrowded admin template. Favor precision, hierarchy, whitespace and a few distinctive visual moments over decoration.

### Design idea: “Signal, not noise”

- Public landing page: bold midnight/navy hero, restrained teal/indigo light effects, product screenshot assembled from real API payloads when available, excellent typography and a clear CTA.
- Dashboard: light neutral canvas with a deep ink sidebar, white surfaces, quiet borders, strong card hierarchy and carefully selected teal/indigo accents. Offer a dark theme toggle only if both themes are completed and contrast-checked.
- Use gradient only as a hero/background accent or small chart emphasis—not behind every card.
- Avoid “AI” clichés: no random neural-network stock illustrations, sparkles everywhere, 3D rotating globes, fake maps, robot mascots or fake real-time pulse animations.
- No invented trust logos, customer testimonials, case-study outcomes, adoption counts, revenue recovered claims or model accuracy guarantees.

## 2. Color tokens

Suggested tokens. Check actual text/background and chart contrast during implementation; adjust values if any combination fails.

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#F5F7FB` | Main app background |
| `--surface` | `#FFFFFF` | Cards, tables, forms |
| `--surface-muted` | `#EEF2F7` | Hover rows, inset summaries |
| `--ink` | `#172033` | Main text |
| `--muted-ink` | `#566277` | Secondary text; avoid too-light grey |
| `--border` | `#DCE3ED` | Borders and dividers |
| `--sidebar` | `#101827` | Dashboard sidebar |
| `--sidebar-muted` | `#AAB6C8` | Sidebar secondary text |
| `--primary` | `#4F46E5` | Main action, active nav, focus accents |
| `--primary-hover` | `#4338CA` | Primary hover state |
| `--teal` | `#0F766E` | Positive insight / secondary chart series |
| `--teal-bright` | `#5EEAD4` | Decorative accents on dark surfaces; not small text by default |
| `--violet` | `#7C3AED` | Distinct analytical series / explainability |
| `--risk-low` | `#15803D` | Low risk badge and series |
| `--risk-medium` | `#B45309` | Medium risk badge and series |
| `--risk-high` | `#BE123C` | High risk badge and series |
| `--info` | `#1D4ED8` | Neutral information state |

Risk badges should combine color, text and optionally a simple icon; never communicate risk only by hue. Apply color tokens consistently and create semantic Tailwind theme names instead of scattering hex values across components.

## 3. Typography and spacing

- Prefer Geist or Inter for interface text, with system fallbacks. Use readable tabular numerals for KPI values, percentages and currency.
- Use a clear type scale: a strong landing H1, page title, section title, card title and body text. Avoid overly tight tracking for long explanatory text.
- Body text should remain comfortably readable (normally 14–16 CSS px for common UI content); chart labels can be compact but must remain legible.
- Use an 8px spacing rhythm with occasional 4px refinements. Align KPI cards, chart shells and page gutters to a shared grid.
- Use consistent corner radius: moderately rounded cards/inputs, not a bubble-like radius on every element. Borders should define surfaces more often than heavy shadows.
- Keep card padding and chart height consistent per page family.

## 4. Landing page route `/`

### Navigation
- Left: compact shield/trend mark and “ChurnGuard AI” wordmark.
- Links: Overview/Platform, How it works, Explainable ML, Insights (anchors if a single page).
- Right: a low-emphasis “View documentation” link only if it points to working docs; prominent “Open Dashboard” CTA.
- Mobile: accessible menu with a proper button, expanded state and keyboard support.

### Hero section
Suggested copy, subject to refinement:

**Eyebrow:** Explainable customer intelligence  
**Headline:** See churn risk clearly. Decide what to do next.  
**Body:** Explore customer behavior, evaluate churn models, and inspect the factors behind every prediction—all in one interactive workspace.  
**Primary CTA:** Explore the dashboard  
**Secondary CTA:** See how it works

Use a split layout: copy on the left, product preview on the right. The preview should be a real interface screenshot or a miniature dashboard composed from actual API values only. If the backend cannot connect, render a designed preview shell with visible “Connect backend to load live metrics” state and no invented KPI values.

### Feature story
Build 3–4 feature cards around genuine product capabilities:
1. Explore the data — inspect the dataset, distributions, missing values and historical patterns.
2. Compare the models — view held-out metrics and performance curves.
3. Explain a prediction — see the backend's real local feature contributions.
4. Prioritize attention — use risk filters, single predictions, scenarios and batch export.

Do not make unsourced claims like “reduces churn by 40%” or “enterprise-grade accuracy.”

### How it works
A four-step horizontal workflow on desktop, vertical timeline on mobile:
1. Inspect historical data.
2. Train and compare models.
3. Score a customer and examine contributing features.
4. Explore hypothetical scenarios and export predictions.

### Explainability / trust section
Describe the difference between probability, class threshold, risk category, global feature importance and local explanation. Note that patterns are learned from historical data and do not establish causation.

### API-aware preview and CTA
Use current health/metadata to state whether the backend is connected, dataset is ready and model is ready. Only show genuine values. The final CTA links to `/dashboard`.

### Footer
Brand summary, internal links, methodology note, API/docs link when reachable, copyright year generated by the system clock, and a visible caveat that model estimates are not guarantees or causal conclusions. No dummy social links.

## 5. Dashboard app shell

### Navigation layout
- Collapsible left sidebar on desktop; off-canvas drawer on mobile with focus management.
- Sidebar groups:
  - **Workspace:** Overview
  - **Customers:** Risk Explorer, Customer Detail (contextual / not necessarily a static menu item)
  - **Prediction Studio:** New Prediction, What-if Lab, Batch Scoring, Prediction History
  - **Insights:** Analytics, Model Lab, Dataset Explorer
  - **System:** API / Model Status, Preferences
- Active route needs an obvious but restrained state.
- Top bar: breadcrumbs, page-level title/context, backend connection state, last refresh from actual payload, manual refresh action, theme toggle if complete, command/search affordance only if implemented.
- Do not show a hardcoded personal avatar/name or false sign-in state. There is no authentication API.

### Overview layout
1. Page intro: “Overview”, concise sentence, refresh action and data source state.
2. A first row of 4 KPI cards:
   - Historical customers.
   - Historical churn rate (explicitly marked actual/historical).
   - Eligible customers scored (model output).
   - High-risk customers (model output).
3. Secondary summary: risk-weighted monthly charges estimate with its caveat, mean predicted probability, selected model/version and saved prediction count.
4. Charts:
   - Historical churn by contract (bar).
   - Historical churn distribution (donut or bar from `customer-distribution` Churn chart).
   - Current active-risk distribution (horizontal bar/progress chart).
   - Churn by tenure band (ordered bars).
5. Customer risk landscape: points from the actual `/customers` API response, e.g., tenure on x, MonthlyCharges on y, risk probability/category as color or symbol. Clearly label that it shows the returned sample/page, not every possible customer unless pagination has loaded all rows. Offer link to the complete paginated Risk Explorer.
6. Recent predictions table from `/predictions/history`, using true timestamps and record IDs.
7. A compact status panel for dataset/model readiness.

Avoid showing trend arrows or percentage change if no relevant time comparison exists. A dataset snapshot cannot justify a temporal sparkline.

## 6. Page-specific experience

### Risk Explorer `/dashboard/customers`
- Filter bar: risk band, contract, tenure range, monthly charge range, probability range, internet service and payment method; searchable customer ID.
- Table columns: Customer ID, risk band, predicted probability, predicted class, tenure, contract, monthly charges, internet service, payment method, row action.
- Server-side page controls use `limit`, `offset` and allowed `sort_by`/`sort_order`.
- Filter chips should show active filters and a working clear-all action.
- Detail view `/dashboard/customers/:customerId` should distinguish actual historical `Churn` from model prediction and show unavailable state for a historical churner rather than trying to predict it through the active-customer route.

### Prediction Studio `/dashboard/predict`
- Use a well-labelled form split into manageable groups: customer profile, service configuration, contract/payment and billing.
- Include sensible dropdowns for categories in the Telco dataset, numeric constraints and inline validation. Avoid giant unstructured forms.
- Have a clear primary “Run prediction” action and secondary “Reset”. Use React Hook Form + Zod if starting fresh.
- On success, show a result panel with probability gauge or bar, risk label, predicted class, returned threshold lines and model version. Keep exact probability and category distinct.
- Show local explanation method and returned contribution values/directions. Include interpretation caveat near the chart.
- Do not predict from frontend heuristics. Only the API supplies the score.

### What-if Lab `/dashboard/scenarios`
- Reuse the baseline customer form or let users choose a customer profile from the dataset with actual fields.
- Create named scenario cards, each containing supported field changes, up to the backend limit of 10.
- Show baseline probability versus scenario probability and the signed difference, risk band changes and changed fields.
- Add a persistent disclaimer: hypothetical output, not causal evidence.
- Submit the exact backend shape; handle invalid fields and server-side validation.

### Batch Scoring `/dashboard/batch`
- Drag/drop or file input with accessible alternative; only CSV; show file name and size before upload.
- Explain required feature columns and limits from backend configuration/help text (default 10 MB / 5,000 rows; backend settings are authoritative).
- Upload as `FormData` field `file` without manually setting multipart boundary.
- Summary cards: submitted, succeeded, failed. Render row-level failures separately from successful predictions.
- Provide the backend-generated CSV download action and clear errors. Never mark failed rows as successful.

### Analytics `/dashboard/analytics`
- Use tabs/sections for Retention, Services, Billing, Customer Profile and Risk.
- Contract / payment / internet service: bar comparisons showing actual counts alongside rates where fields are available.
- Tenure: ordered categorical bar chart, no date line.
- Services: filterable grouped table or horizontal bar chart with service and category selectors.
- Billing: charge bands and churn rates, with separate view for active risk counts where returned.
- Demographics: aggregate-only, neutral language; avoid suggesting demographic attributes cause churn.
- Use tooltips with counts and numerator/denominator when present; a rate without its sample size can mislead.

### Model Lab `/dashboard/model-lab`
- Candidate model comparison by real accuracy, precision, recall, F1 and ROC-AUC returned by `/model/comparison`.
- Clearly badge selected model and the actual selection criterion.
- Confusion matrix using real holdout values.
- ROC and precision-recall line curves from actual curve endpoints, each with axes and appropriate baseline context.
- Threshold comparison table/plot only from endpoint data.
- Global permutation-importance bars; explain that it reflects held-out ROC-AUC sensitivity to shuffled input columns, not causal influence.
- Evaluation note and dataset/model versions.

### Dataset Explorer `/dashboard/dataset`
- Dataset status and fingerprint/loaded timestamp.
- Summary cards: rows, columns, historical churn distribution, duplicates removed.
- Data table with pagination, sorting and known column data types.
- Missing values chart/table with missing count and percentage; compare before/after cleaning only where returned.
- Numeric profile and categorical top-value summaries.
- Explain that `customerID` and `Churn` are excluded from predictor features.

### Prediction History `/dashboard/history`
- Paginated table with true `created_at`, record ID, customer ID when present, probability, predicted class, risk category and model version.
- Risk filter.
- Detail drawer/page for the actual stored input snapshot and explanation summary.
- Empty state when no predictions have been made. Do not manufacture history.

### System / preferences
- API connection state, dataset readiness and model readiness from health/metadata.
- Show how to configure `VITE_API_BASE_URL` and backend CORS.
- Theme preference can be local storage if implemented. Do not display editable risk thresholds as though the backend will save them: there is no setting mutation endpoint.
- Avoid a “Retrain model” server action; training is a documented backend CLI action.

## 7. Chart selection guide

| Actual data | Best chart | Avoid |
|---|---|---|
| Churn rate across contracts/services/payment methods | Sorted bar or dot plot with a rate axis; show count in tooltip | 3D bars, pie chart with many categories |
| Binary historical target mix | Donut or simple bar plus exact counts | A donut without labels/accessible summary |
| Risk band distribution | Horizontal bars with counts and percentage | Red/amber/green as the only meaning |
| Tenure bands | Ordered bars | Continuous line chart implying calendar time |
| Charge bands | Histogram-style bar chart with band labels | Mislabeling quantile groups as equal-width bins |
| Model metrics | Grouped bars or compact sortable table; metrics have distinct units | A single blended score that hides metric tradeoffs |
| Confusion matrix | 2×2 heatmap/grid with counts and class-axis labels | Unlabelled colored squares |
| ROC / precision-recall | Line chart with labelled axes, points from backend | Smoothing or altering raw model coordinates without explanation |
| Global feature importance | Sorted horizontal bars | Calling it a local explanation or causal effect |
| Individual explanation | Diverging horizontal bars using returned signed contributions | Invented natural-language reasons or claiming SHAP |
| Customer risk landscape | Scatter of true customer records with tenure and MonthlyCharges; risk encoded by label + shape/color | Any geospatial map; invented customer clusters/pins |
| Prediction history | Table, optionally real prediction count grouped by actual `created_at` date if useful | Historical churn trends based on a dataset with no event dates |

## 8. Interaction standards

- Meaningful hover/focus states; no hover-only information necessary to complete tasks.
- Use skeletons sized to the final layout to reduce layout shift.
- Every asynchronous button shows loading and prevents duplicate submissions while pending.
- Use inline field validation and a summary for server validation failures.
- Toasts may confirm completed operations but do not replace inline error details.
- Empty states explain the next useful action rather than simply saying “No data”.
- Make charts resize; set chart container height and width explicitly enough for responsive measurements.
- Respect reduced-motion preference; animations should be subtle and not required to understand status.
- Ensure mobile tables become horizontally scrollable or convert to cards without making important values inaccessible.

## 9. Responsive design

- Work mobile-first, then tablet and desktop. Use responsive grid columns rather than fixed pixel widths.
- Small mobile: single-column dashboard cards, compact title areas, sidebar drawer, readable controls, chart legends wrap/scroll, filters collapse into a sheet.
- Tablet: two-column cards/charts when room permits.
- Large desktop: 12-column grid, 2–3 columns per dashboard row, consistent max content width and generous whitespace.
- No horizontal page overflow at 320–375 px widths. Tables may scroll within their own container.

## 10. Accessibility and verification

- Meet WCAG 2.2 AA intent: normal text contrast at least 4.5:1 and large text at least 3:1; meaningful non-text UI/chart elements need adequate contrast too. Check actual rendered palette combinations.
- All controls have accessible labels, buttons have real text or accessible names, input fields associate with labels/errors, keyboard focus is visible, dialogs restore focus, and navigation works by keyboard.
- Use chart accessibility support (e.g. Recharts `accessibilityLayer` where supported) and provide short accompanying textual/ tabular summaries for critical insights.
- Risk communication uses text and color together.
- Test mobile responsiveness and loading/empty/error states, not only the populated desktop happy path.

## 11. References

See `RESEARCH_REFERENCES.md` for official Antigravity, shadcn/ui, Recharts, Tailwind, TanStack Query, Lucide and W3C resources behind these choices.
