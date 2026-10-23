"""
SkyWings Demand Forecasting - FastAPI Service
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="SkyWings Demand Forecasting ML")

MODEL_PATH = "models/time_series/artifacts/demand_model.pkl"

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Demand Forecasting Model loaded successfully!")
    else:
        print(f"❌ Model not found at {MODEL_PATH}")

# ✅ EXACT 24 features the model was trained on
class DemandRequest(BaseModel):
    # Identifiers
    route: str
    from_code: str
    to_code: str
    
    # Base features from DB
    cancellations: int
    loadFactor: float
    isWeekend: bool
    isHoliday: bool
    weatherScore: float
    competitorFare: float
    promotionActive: bool
    
    # Calendar features
    day_of_week: int
    month: int
    day_of_month: int
    quarter: int
    week_of_year: int
    is_weekend_calc: int
    dow_sin: float
    dow_cos: float
    month_sin: float
    month_cos: float
    
    # Lag & Rolling features
    lag_1d: float
    lag_7d: float
    lag_14d: float
    rolling_mean_7d: float
    rolling_std_7d: float
    rolling_mean_14d: float
    rolling_std_14d: float

class DemandResponse(BaseModel):
    route: str
    predicted_bookings: int
    confidence: str

@app.post("/predict-demand", response_model=DemandResponse)
def predict_demand(req: DemandRequest):
    try:
        # Convert request to dictionary
        data = req.dict()
        
        # Drop identifiers (Model doesn't need them)
        for col in ['route', 'from_code', 'to_code']:
            data.pop(col, None)
            
        # Create DataFrame
        df_features = pd.DataFrame([data])
        
        # Predict
        prediction = model.predict(df_features)[0]
        prediction = max(0, int(prediction)) # No negative bookings
        
        return DemandResponse(
            route=f"{req.from_code}-{req.to_code}",
            predicted_bookings=prediction,
            confidence="high" if prediction > 0 else "low"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "demand_forecasting"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
