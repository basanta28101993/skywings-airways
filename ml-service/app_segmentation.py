"""
SkyWings Customer Segmentation - FastAPI Service
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
from data_platform.features.rfm_features import create_rfm_features

app = FastAPI(title="SkyWings Customer Segmentation ML")

MODEL_PATH = "models/segmentation/artifacts/kmeans_model.pkl"
SCALER_PATH = "models/segmentation/artifacts/scaler.pkl"
DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"

@app.on_event("startup")
def load_model():
    global model, scaler
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("✅ K-Means Model and Scaler loaded successfully!")
    else:
        print("❌ Model not found!")

class SegmentRequest(BaseModel):
    email: str

class SegmentResponse(BaseModel):
    email: str
    segment_id: int
    segment_name: str
    recency: int
    frequency: int
    monetary: float
    recommendation: str

# Cluster mapping based on our training analysis
SEGMENT_NAMES = {
    0: "Family / Leisure",
    1: "Budget Traveler",
    2: "Business VIP"
}

SEGMENT_RECOMMENDATIONS = {
    0: "Offer family packages, vacation bundles, and holiday deals.",
    1: "Send discount codes, economy fare drops, and low-cost add-ons.",
    2: "Offer business class upgrades, lounge access, and premium fast-track."
}

@app.post("/segment-customer", response_model=SegmentResponse)
def segment_customer(req: SegmentRequest):
    try:
        # 1. Fetch customer bookings from DB
        engine = create_engine(DB_URL)
        query = text('SELECT "passengerEmail", "pnr", "createdAt", "totalPrice" FROM "Booking" WHERE "passengerEmail" = :email')
        df = pd.read_sql(query, engine, params={"email": req.email})
        
        if len(df) == 0:
            raise HTTPException(status_code=404, detail="No bookings found for this email.")

        # 2. Calculate RFM
        rfm_df = create_rfm_features(df)
        if len(rfm_df) == 0:
            raise HTTPException(status_code=400, detail="Could not calculate RFM.")

        # 3. Extract features and scale
        features = rfm_df[['recency', 'frequency', 'monetary']]
        scaled_features = scaler.transform(features)

        # 4. Predict
        cluster_id = int(model.predict(scaled_features)[0])
        
        # 5. Return
        return SegmentResponse(
            email=req.email,
            segment_id=cluster_id,
            segment_name=SEGMENT_NAMES.get(cluster_id, "Unknown"),
            recency=int(features['recency'].iloc[0]),
            frequency=int(features['frequency'].iloc[0]),
            monetary=round(float(features['monetary'].iloc[0]), 2),
            recommendation=SEGMENT_RECOMMENDATIONS.get(cluster_id, "No recommendation available.")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "segmentation"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
