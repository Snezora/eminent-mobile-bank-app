from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel
import shap
import numpy as np
import pandas as pd
import joblib
import sklearn
from catboost import CatBoostClassifier
import lightgbm as lgb
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier

app = FastAPI()

# 1. Load the model when the application starts
try:
    model = joblib.load("model.joblib")
    scaler = joblib.load("scaler.pkl")
    model_columns = joblib.load("model_columns.pkl")
    model_columns = [col for col in model_columns if col not in ['id', 'loan_status']]
    skewed_features = joblib.load("skewed_features.pkl")
except FileNotFoundError:
    print("Error: 'model.joblib' not found.")
    model = None
    explainer = None
    scaler = None
else:
    # Initialize the SHAP explainer based on model type
    try:
        background = np.zeros((1, len(model_columns)))
        explainer = shap.KernelExplainer(model.predict_proba, background)
    except Exception as e:
        print(f"Error initializing SHAP explainer: {e}")
        explainer = None
    
class PredictionInput(BaseModel):
    person_age: int
    person_income: int
    person_home_ownership: str
    person_emp_length: int
    loan_intent: str
    loan_grade: str
    loan_amnt: float
    loan_int_rate: float
    cb_person_default_on_file: bool
    cb_person_cred_hist_length: int
    
class PredictionResponse(BaseModel):
    prediction: float
    shap_values: dict = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/predict")
async def predict(data: PredictionInput):
    if model is None or explainer is None:
        return {"error": "Model or SHAP explainer not loaded."}

    input_df = pd.DataFrame([data.dict()])

    # One-hot encode categorical columns
    input_df = pd.get_dummies(input_df)
    input_df = input_df.reindex(columns=model_columns, fill_value=0)

    # Convert boolean columns to int (1/0)
    for col in input_df.columns:
        if input_df[col].dtype == bool:
            input_df[col] = input_df[col].astype(int)

    # Apply log1p to skewed features
    for feature in skewed_features:
        if feature in input_df.columns:
            input_df[feature] = np.log1p(input_df[feature])

    # Scale numerical features
    numerical_features = [col for col in scaler.feature_names_in_ if col in input_df.columns]
    input_df[numerical_features] = scaler.transform(input_df[numerical_features])

    # Make prediction
    try:
        prediction = model.predict_proba(input_df)[:, 1][0]
    except Exception as e:
        return {"error": f"Prediction failed: {e}"}

    # Calculate SHAP values
    try:
        shap_values = explainer.shap_values(input_df)
        # If it's a list (e.g., per class), pick the positive class if binary
        if isinstance(shap_values, list):
            shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        # Now shap_values should be (n_samples, n_features) or (n_features,)
        # If it's 2D, select the first sample
        if hasattr(shap_values, "shape") and len(shap_values.shape) == 2:
            shap_values_row = shap_values[0]
        elif hasattr(shap_values, "__len__") and len(shap_values) == len(input_df.columns):
            shap_values_row = shap_values
        else:
            # Try to flatten if it's still nested
            shap_values_row = np.array(shap_values).flatten()
        # Convert to float for JSON
        shap_dict = {str(col): float(val) for col, val in zip(input_df.columns, shap_values_row)}
    except Exception as e:
        shap_dict = {"error": f"SHAP calculation failed: {e}"}

    return {
        "prediction": float(prediction),
        "shap_values": shap_dict
    }