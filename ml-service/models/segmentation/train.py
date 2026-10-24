"""
Customer Segmentation Model Training (K-Means)
"""
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine
import joblib
import os
import sys

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from data_platform.features.rfm_features import create_rfm_features

# 1. Extract Data
print("📥 Extracting bookings from DB...")
DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)
df = pd.read_sql("SELECT \"passengerEmail\", \"pnr\", \"createdAt\", \"totalPrice\" FROM \"Booking\"", engine)

# 2. Transform Data
rfm_df = create_rfm_features(df)

# 3. Prepare Data for K-Means
# We need to scale the data so Monetary doesn't dominate Recency/Frequency
scaler = StandardScaler()
rfm_scaled = scaler.fit_transform(rfm_df[['recency', 'frequency', 'monetary']])

# 4. Train K-Means
# Based on our synthetic data, we expect 3 distinct groups (Business, Budget, Family)
N_CLUSTERS = 3
print(f"\n🤖 Training K-Means with {N_CLUSTERS} clusters...")
kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
kmeans.fit(rfm_scaled)

# 5. Assign Clusters to original data
rfm_df['segment'] = kmeans.labels_

# 6. Analyze Clusters
print("\n📊 Cluster Analysis (Averages):")
cluster_summary = rfm_df.groupby('segment')[['recency', 'frequency', 'monetary']].mean().round(2)
print(cluster_summary)

# 7. Save Model & Scaler
os.makedirs("models/segmentation/artifacts", exist_ok=True)
joblib.dump(kmeans, "models/segmentation/artifacts/kmeans_model.pkl")
joblib.dump(scaler, "models/segmentation/artifacts/scaler.pkl")
print("\n✅ K-Means Model and Scaler saved!")
