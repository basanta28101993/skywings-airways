"""
SkyWings Fraud Detection - FastAPI Service
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import sys

# Add root to path to import data_platform
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
from data_platform.features.fraud_features import add_fraud_features

app = FastAPI(title="SkyWings Fraud Detection ML")

MODEL_PATH = "models/fraud/artifacts/fraud_model.pkl"

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Fraud Detection Model loaded successfully!")
    else:
        print(f"❌ Model not found at {MODEL_PATH}")

# Raw input from the frontend (before feature engineering)
class TransactionRequest(BaseModel):
    amount: float
    paymentMethod: str      # 'card', 'upi', 'netbanking'
    ipCountry: str          # e.g., 'IN', 'US'
    billingCountry: str     # e.g., 'IN'
    deviceType: str         # 'web', 'ios', 'android', 'unknown'
    bookingHour: int        # 0-23

class FraudResponse(BaseModel):
    is_fraud: bool
    fraud_probability: float
    risk_level: str         # 'Low', 'Medium', 'High'

@app.post("/predict-fraud", response_model=FraudResponse)
def predict_fraud(req: TransactionRequest):
    try:
        # 1. Convert request to a Pandas DataFrame
        data = req.dict()
        df = pd.DataFrame([data])
        
        # 2. Apply our Enterprise Feature Engineering pipeline
        df = add_fraud_features(df)
        
        # 3. Predict
        prob = float(model.predict_proba(df)[0][1]) # Probability of class 1 (Fraud)
        is_fraud = bool(prob > 0.5)
        
        # Determine risk level for business logic
        if prob > 0.8:
            risk = "High"
        elif prob > 0.4:
            risk = "Medium"
        else:
            risk = "Low"
            
        return FraudResponse(
            is_fraud=is_fraud,
            fraud_probability=round(prob, 4),
            risk_level=risk
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "fraud_detection"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
