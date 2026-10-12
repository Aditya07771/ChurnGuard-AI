# ChurnGuard AI

Explainable customer churn prediction and retention intelligence — a FastAPI ML backend with a React + TypeScript analytics workspace.

## Architecture

```mermaid
flowchart TB
    subgraph FE["Frontend — React · TypeScript · Vite"]
        direction TB
        Pages["Pages<br/>Landing · Overview · Risk Explorer<br/>Prediction Studio · What-if Lab<br/>Batch Scoring · Analytics<br/>Model Lab · Dataset Explorer · History"]
        Query["TanStack Query hooks<br/>cache · retry · invalidation"]
        Services["Typed API services"]
        HttpClient["Axios API client<br/>VITE_API_BASE_URL"]
        Pages --> Query --> Services --> HttpClient
    end

    subgraph BE["Backend — FastAPI · /api/v1"]
        direction TB
        Routers["Routers<br/>health · overview · dataset · analytics<br/>customers · predictions · scenarios · model"]
        DomainServices["Services<br/>dataset · analytics · customer<br/>prediction · scenario"]
        ML["ML pipeline<br/>data_loader · preprocessing<br/>train · predictor · model_registry"]
        Repository["Repository · SQLAlchemy"]
        Routers --> DomainServices
        DomainServices --> ML
        DomainServices --> Repository
    end

    subgraph CLI["CLI scripts"]
        Scripts["download_dataset<br/>train_model<br/>score_customers"]
    end

    subgraph STORE["Local storage"]
        CSV[("Telco CSV<br/>data/raw")]
        Artifacts[("Model pipeline + metadata<br/>artifacts/*.joblib · *.json")]
        DB[("SQLite<br/>data/churn_guard.db")]
    end

    HttpClient -->|"HTTP · JSON"| Routers
    ML --> CSV
    ML --> Artifacts
    Repository --> DB
    Scripts --> ML
```

See [`Backend/README.md`](Backend/README.md) and [`Frontend/README.md`](Frontend/README.md) for setup and usage.
