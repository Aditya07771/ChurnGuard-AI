# Model artifacts

The ZIP includes model artifacts only when a real local training run completed and the files passed loading/prediction checks.
Artifacts created by `scripts/train_model.py` are trusted local joblib files and should not be replaced with files from unknown sources.
To rebuild them after updating the dataset or dependencies, run:

```powershell
python -m scripts.train_model
```
