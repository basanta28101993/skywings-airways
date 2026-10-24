"""
SkyWings Anomaly Detection - FastAPI Service
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="SkyWings Anomaly Detection ML")

MODEL_PATH = "models/anomaly/artifacts/anomaly_model.pkl"

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Anomaly Model loaded successfully!")
    else:
        print("❌ Model not found!")

class MetricRequest(BaseModel):
    cpuUsage: float
    memoryUsage: float
    latency: float
    errorRate: float

class AnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    status: str

@app.post("/predict-anomaly", response_model=AnomalyResponse)
def predict_anomaly(req: MetricRequest):
    try:
        # 1. Prepare data
        data = pd.DataFrame([{
            'cpuUsage': req.cpuUsage,
            'memoryUsage': req.memoryUsage,
            'latency': req.latency,
            'errorRate': req.errorRate
        }])
        
        # 2. Predict
        # Isolation Forest returns 1 for normal, -1 for anomaly
        pred = model.predict(data)[0]
        is_anomaly = bool(pred == -1)
        
        # Get anomaly score (lower = more anomalous)
        score = float(model.decision_function(data)[0])
        
        return AnomalyResponse(
            is_anomaly=is_anomaly,
            anomaly_score=round(score, 4),
            status="Critical" if is_anomaly else "Healthy"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "anomaly_detection"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
