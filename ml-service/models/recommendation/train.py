"""
Recommendation System Model Training (Collaborative Filtering)
Using scikit-surprise SVD algorithm.
"""
import pandas as pd
import numpy as np
from surprise import Dataset, Reader, SVD
from sqlalchemy import create_engine
import joblib
import os

# 1. Extract Data
print("📥 Extracting ancillary purchases from DB...")
DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)

# We need: User (passengerEmail), Item (itemId), Rating (We'll use a dummy rating of 1.0 since it's implicit data)
query = """
    SELECT b."passengerEmail" as user, ap."itemId" as item, 1.0 as rating
    FROM "AncillaryPurchase" ap
    JOIN "Booking" b ON ap."bookingId" = b.id
"""
df = pd.read_sql(query, engine)
print(f"   Loaded {len(df)} purchase records.")

# 2. Prepare Data for Surprise
# Surprise requires a Reader object with the rating scale
reader = Reader(rating_scale=(0, 1))
data = Dataset.load_from_df(df[['user', 'item', 'rating']], reader)

# Build full trainset (we are using all data for training in this demo)
trainset = data.build_full_trainset()

# 3. Train Model
print("\n🤖 Training SVD Recommendation Model...")
# SVD (Singular Value Decomposition) is great for Collaborative Filtering
algo = SVD(n_factors=50, random_state=42)
algo.fit(trainset)

# 4. Save Model & Data mappings
os.makedirs("models/recommendation/artifacts", exist_ok=True)
joblib.dump(algo, "models/recommendation/artifacts/recommendation_model.pkl")
print("✅ Recommendation Model saved!")

# Save item metadata for the API to return names/prices
items_query = 'SELECT id, name, category, price FROM "AncillaryItem"'
df_items = pd.read_sql(items_query, engine)
joblib.dump(df_items, "models/recommendation/artifacts/items_metadata.pkl")
print("✅ Item metadata saved!")
