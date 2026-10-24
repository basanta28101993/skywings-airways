"""
SkyWings Recommendation System - FastAPI Service
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="SkyWings Recommendation ML")

MODEL_PATH = "models/recommendation/artifacts/recommendation_model.pkl"
ITEMS_PATH = "models/recommendation/artifacts/items_metadata.pkl"

@app.on_event("startup")
def load_model():
    global model, df_items
    if os.path.exists(MODEL_PATH) and os.path.exists(ITEMS_PATH):
        model = joblib.load(MODEL_PATH)
        df_items = joblib.load(ITEMS_PATH)
        print("✅ Recommendation Model and Item Metadata loaded successfully!")
    else:
        print("❌ Model or Metadata not found!")

class RecommendationRequest(BaseModel):
    email: str
    top_n: int = 3

class ItemRecommendation(BaseModel):
    item_id: str
    name: str
    category: str
    price: float
    predicted_score: float

class RecommendationResponse(BaseModel):
    email: str
    recommendations: list[ItemRecommendation]

@app.post("/recommend", response_model=RecommendationResponse)
def recommend_items(req: RecommendationRequest):
    try:
        # Get all unique item IDs
        all_item_ids = df_items['id'].tolist()
        
        predictions = []
        
        # Predict rating for every item for this user
        for item_id in all_item_ids:
            # model.predict returns (user, item, actual_rating, estimated_rating, details)
            pred = model.predict(uid=req.email, iid=item_id)
            predictions.append((item_id, pred.est))
            
        # Sort by estimated rating descending
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        # Get top N
        top_predictions = predictions[:req.top_n]
        
        # Build response
        recommendations = []
        for item_id, score in top_predictions:
            # Fetch item details from metadata
            item_row = df_items[df_items['id'] == item_id].iloc[0]
            recommendations.append({
                "item_id": item_id,
                "name": item_row['name'],
                "category": item_row['category'],
                "price": float(item_row['price']),
                "predicted_score": round(score, 4)
            })
            
        return RecommendationResponse(
            email=req.email,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "recommendation"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
