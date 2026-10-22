"""
SkyWings Dynamic Pricing - FastAPI Service
ML model কে REST API হিসেবে serve করে।
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np

app = FastAPI(
    title="SkyWings Pricing ML Service",
    description="Dynamic pricing prediction API",
    version="1.0.0",
)

# ============================================================
# Route distance mapping (from training data)
# ============================================================
ROUTE_DISTANCE = {
    ('DEL', 'BOM'): 1400,
    ('BOM', 'GOA'): 590,
    ('DEL', 'BLR'): 2150,
    ('BLR', 'BOM'): 980,
    ('BOM', 'DEL'): 1400,
}


def get_distance(from_code: str, to_code: str) -> int:
    """Get distance for route, return 1000 as default if unknown."""
    return ROUTE_DISTANCE.get((from_code.upper(), to_code.upper()), 1000)


# ============================================================
# Load model + encoders at startup
# ============================================================
print("📦 Loading model artifacts...")
model = joblib.load('pricing_model.pkl')
le_from = joblib.load('le_from.pkl')
le_to = joblib.load('le_to.pkl')
print(f"✅ Model loaded (sklearn Gradient Boosting)")
print(f"✅ Encoders loaded: from={list(le_from.classes_)}, to={list(le_to.classes_)}")


# ============================================================
# Request / Response schemas
# ============================================================
class PricingRequest(BaseModel):
    from_code: str = Field(..., description="Origin airport code (DEL, BOM, BLR, GOA)")
    to_code: str = Field(..., description="Destination airport code")
    base_price: float = Field(..., gt=0, description="Base price in INR")
    days_until_flight: int = Field(..., ge=1, le=365)
    departure_hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6, description="0=Mon, 6=Sun")
    seats_available: int = Field(..., ge=0, le=500)
    is_weekend: int = Field(..., ge=0, le=1)
    is_holiday: int = Field(0, ge=0, le=1)


class PricingResponse(BaseModel):
    base_price: float
    dynamic_price: float
    multiplier: float
    surge_reason: str
    confidence: str


# ============================================================
# Helper: determine reason for price change
# ============================================================
def get_surge_reason(req: PricingRequest) -> str:
    if req.days_until_flight <= 3:
        return "Last-minute booking (very high demand)"
    elif req.days_until_flight <= 7:
        return "Last-minute booking"
    elif req.is_holiday == 1:
        return "Holiday season"
    elif req.seats_available <= 20:
        return "High demand (few seats left)"
    elif 6 <= req.departure_hour <= 9 or 17 <= req.departure_hour <= 21:
        return "Peak travel hours"
    elif req.is_weekend == 1:
        return "Weekend travel"
    elif req.days_until_flight > 60:
        return "Early bird discount"
    return "Standard pricing"


# ============================================================
# Routes
# ============================================================
@app.get("/")
def root():
    return {
        "service": "SkyWings Pricing ML",
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PricingResponse)
def predict_price(req: PricingRequest):
    try:
        # ---------- 1. Validate & encode route ----------
        try:
            from_enc = int(le_from.transform([req.from_code.upper()])[0])
            to_enc = int(le_to.transform([req.to_code.upper()])[0])
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid route: {req.from_code} → {req.to_code}. "
                    f"Supported from: {list(le_from.classes_)}, "
                    f"to: {list(le_to.classes_)}"
                ),
            )

        # ---------- 2. Get distance for this route ----------
        distance = get_distance(req.from_code, req.to_code)

        # ---------- 3. Build feature vector (MATCHES training order) ----------
        # Training order:
        # from_encoded, to_encoded, base_price, distance_km,
        # days_until_flight, departure_hour, day_of_week,
        # seats_available, is_weekend, is_holiday
        features = np.array([[
            from_enc,
            to_enc,
            req.base_price,
            distance,
            req.days_until_flight,
            req.departure_hour,
            req.day_of_week,
            req.seats_available,
            req.is_weekend,
            req.is_holiday,
        ]])

        # ---------- 4. Predict ----------
        predicted = float(model.predict(features)[0])

        # Floor at base_price (never below base)
        dynamic_price = max(predicted, req.base_price)

        multiplier = dynamic_price / req.base_price
        reason = get_surge_reason(req)

        # Confidence based on multiplier range
        if 0.95 <= multiplier <= 1.7:
            confidence = "high"
        elif 0.85 <= multiplier <= 2.0:
            confidence = "medium"
        else:
            confidence = "low"

        return PricingResponse(
            base_price=round(req.base_price, 2),
            dynamic_price=round(dynamic_price, 2),
            multiplier=round(multiplier, 3),
            surge_reason=reason,
            confidence=confidence,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ============================================================
# Local dev entrypoint
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
