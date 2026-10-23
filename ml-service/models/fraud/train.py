"""
Fraud Detection Model Training (Classification)
"""
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sqlalchemy import create_engine
import joblib
import os
import sys

# Add root to path to import data_platform
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from data_platform.features.fraud_features import add_fraud_features

# 1. Extract Data
print("📥 Extracting transactions from DB...")
DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)
df = pd.read_sql("SELECT * FROM \"Transaction\"", engine)
print(f"   Loaded {len(df)} transactions.")

# 2. Transform Data
df = add_fraud_features(df)

# 3. Split Data
X = df.drop(columns=['isFraud'])
y = df['isFraud']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Calculate scale_pos_weight for imbalanced data
# (Number of negative / Number of positive)
neg_cases = (y_train == 0).sum()
pos_cases = (y_train == 1).sum()
scale_weight = neg_cases / pos_cases
print(f"\n📊 Data Split: Train={len(X_train)}, Test={len(X_test)}")
print(f"   Imbalance Ratio (scale_pos_weight): {scale_weight:.2f}")

# 4. Train Model
print("\n🤖 Training XGBoost Classifier...")
model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    scale_pos_weight=scale_weight, # Handles imbalance
    random_state=42,
    eval_metric='auc'
)

model.fit(X_train, y_train)

# 5. Evaluate
print("\n📈 Evaluating Model...")
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred, target_names=['Genuine', 'Fraud']))
print(f"ROC-AUC Score: {roc_auc_score(y_test, y_proba):.4f}")

# 6. Save
os.makedirs("models/fraud/artifacts", exist_ok=True)
joblib.dump(model, "models/fraud/artifacts/fraud_model.pkl")
print("✅ Fraud Model saved!")
