"""
Anomaly Detection Model Training (Isolation Forest)
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import classification_report
from sqlalchemy import create_engine
import joblib
import os

# 1. Extract Data
print("📥 Extracting system metrics from DB...")
DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)
df = pd.read_sql('SELECT "cpuUsage", "memoryUsage", "latency", "errorRate", "isAnomaly" FROM "SystemMetric"', engine)
print(f"   Loaded {len(df)} records.")

# 2. Prepare Data
# Features (X) - we do NOT use isAnomaly for training, only for evaluation
features = ['cpuUsage', 'memoryUsage', 'latency', 'errorRate']
X = df[features]
y_true = df['isAnomaly'].astype(int) # 1 for Anomaly, 0 for Normal

# 3. Train Isolation Forest
print("\n🤖 Training Isolation Forest...")
# contamination=0.05 because we generated 5% anomalies. 
# In real life, you might not know this, so you can set it to 'auto'.
model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
model.fit(X)

# 4. Evaluate Model
# Predict returns 1 for normal, -1 for anomaly. We map it to 0 (normal) and 1 (anomaly).
y_pred_raw = model.predict(X)
y_pred = np.where(y_pred_raw == -1, 1, 0)

print("\n📈 Evaluating Model (vs Ground Truth):")
print(classification_report(y_true, y_pred, target_names=['Normal', 'Anomaly']))

# 5. Save Model
os.makedirs("models/anomaly/artifacts", exist_ok=True)
joblib.dump(model, "models/anomaly/artifacts/anomaly_model.pkl")
print("✅ Anomaly Model saved!")
