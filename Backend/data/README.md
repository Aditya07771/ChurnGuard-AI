# Dataset setup

The backend uses the public Kaggle dataset `blastchar/telco-customer-churn` and expects the file
`WA_Fn-UseC_-Telco-Customer-Churn.csv`.

The raw CSV is intentionally not bundled in the source ZIP because redistribution permissions were not verified.
Download it after installing requirements with:

```powershell
python -m scripts.download_dataset
```

The file is cached under `data/raw/`. For offline/manual setup, obtain the dataset from
https://www.kaggle.com/datasets/blastchar/telco-customer-churn and place the CSV in `data/raw/`,
or set `LOCAL_DATASET_PATH` in `.env` to a valid CSV location.

The loader validates the columns and target before accepting the file. It records the dataset SHA-256 fingerprint and cleaning report for reproducibility.
