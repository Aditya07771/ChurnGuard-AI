"""Validated customer inputs. Churn and customerID are deliberately not features."""
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.utils.data_validation import CATEGORICAL_COLUMNS

class CustomerFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    gender: str = Field(min_length=1, max_length=80)
    SeniorCitizen: int = Field(ge=0, le=1)
    Partner: str = Field(min_length=1, max_length=80)
    Dependents: str = Field(min_length=1, max_length=80)
    tenure: int = Field(ge=0, le=72)
    PhoneService: str = Field(min_length=1, max_length=80)
    MultipleLines: str = Field(min_length=1, max_length=80)
    InternetService: str = Field(min_length=1, max_length=80)
    OnlineSecurity: str = Field(min_length=1, max_length=80)
    OnlineBackup: str = Field(min_length=1, max_length=80)
    DeviceProtection: str = Field(min_length=1, max_length=80)
    TechSupport: str = Field(min_length=1, max_length=80)
    StreamingTV: str = Field(min_length=1, max_length=80)
    StreamingMovies: str = Field(min_length=1, max_length=80)
    Contract: str = Field(min_length=1, max_length=80)
    PaperlessBilling: str = Field(min_length=1, max_length=80)
    PaymentMethod: str = Field(min_length=1, max_length=120)
    MonthlyCharges: float = Field(ge=0, le=10000)
    TotalCharges: float | None = Field(default=None, ge=0, le=1000000)

    @field_validator(*CATEGORICAL_COLUMNS)
    @classmethod
    def strip_category_values(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

class CustomerWithId(CustomerFeatures):
    customerID: str = Field(min_length=1, max_length=128)

class WhatIfVariant(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    changes: dict[str, str | int | float | None]

class WhatIfRequest(BaseModel):
    customer: CustomerFeatures
    scenarios: list[WhatIfVariant] = Field(min_length=1, max_length=10)
