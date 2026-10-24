"""
Time Series Model Training (Demand Forecasting)
Uses LightGBM to predict daily bookings based on calendar and lag features.
"""
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error
import os
import joblib

# 1. Load Features from Feature Store
print("📥 Loading features from Feature Store...")
feature_path = "feature_store/offline/features_v1.parquet"
df = pd.read_parquet(feature_path)
print(f"   Loaded {len(df)} rows and {len(df.columns)} columns.")

# 2. Prepare Data
# We need to sort by date to prevent data leakage when splitting
df['date'] = pd.to_datetime(df['date'])
df = df.sort_values('date').reset_index(drop=True)

# Features (X) and Target (y)
# Drop columns that are not useful for prediction (IDs, exact date, target itself)
drop_cols = ['bookings', 'date', 'route', 'fromCode', 'toCode', 'revenue', 'avgFare']
X = df.drop(columns=drop_cols)
y = df['bookings']

# Time-based Split (80% Train, 20% Test)
split_idx = int(len(df) * 0.8)
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

print(f"\n📊 Data Split:")
print(f"   Train: {len(X_train)} rows (up to {df['date'].iloc[split_idx-1].date()})")
print(f"   Test:  {len(X_test)} rows (from {df['date'].iloc[split_idx].date()})")

# 3. Train LightGBM Model
print("\n🤖 Training LightGBM Model...")
model = lgb.LGBMRegressor(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=7,
    random_state=42,
    n_jobs=-1
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    eval_metric='rmse',
    # callbacks=[lgb.early_stopping(stopping_rounds=20)] # Uncomment if you want early stopping
)

# 4. Evaluate Model
print("\n📈 Evaluating Model...")
y_pred = model.predict(X_test)
y_pred = np.maximum(y_pred, 0) # Bookings can't be negative

# Calculate MAPE (Mean Absolute Percentage Error) safely
# (avoid division by zero by adding a small epsilon to denominator)
mape = np.mean(np.abs((y_test - y_pred) / np.maximum(y_test, 1))) * 100
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

print(f"   RMSE: {rmse:.2f} bookings")
print(f"   MAPE: {mape:.2f}%")

# 5. Feature Importance
print("\n🔝 Top 5 Important Features:")
importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
for i, row in importance.head(5).iterrows():
    print(f"   - {row['feature']}: {row['importance']}")

# 6. Save Model
print("\n💾 Saving Model...")
os.makedirs("models/time_series/artifacts", exist_ok=True)
model_path = "models/time_series/artifacts/demand_model.pkl"
joblib.dump(model, model_path)
print(f"   ✅ Saved to: {model_path}")

print("\n🎯 Demand Forecasting Model is ready for API deployment!")
