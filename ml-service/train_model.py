"""
SkyWings Dynamic Pricing - ML Model Training
Gradient Boosting Regressor use করে price predict করবে।
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib

print("📂 Loading training data...")
df = pd.read_csv('training_data.csv')
print(f"   Loaded {len(df)} rows")

# Encode categorical (from/to city codes)
le_from = LabelEncoder()
le_to = LabelEncoder()
df['from_encoded'] = le_from.fit_transform(df['from_code'])
df['to_encoded'] = le_to.fit_transform(df['to_code'])

print(f"\n🔤 Encoded routes:")
for i, code in enumerate(le_from.classes_):
    print(f"   {code} → {i}")

# Features
feature_cols = [
    'from_encoded', 'to_encoded', 'base_price', 'distance_km',
    'days_until_flight', 'departure_hour', 'day_of_week',
    'seats_available', 'is_weekend', 'is_holiday'
]
X = df[feature_cols]
y = df['final_price']

# Train/test split (80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\n📊 Train/Test Split:")
print(f"   Train: {len(X_train)} samples")
print(f"   Test:  {len(X_test)} samples")

# Train model
print(f"\n🤖 Training Gradient Boosting model...")
model = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

# MAPE (Mean Absolute Percentage Error)
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

print(f"\n✅ Model trained!")
print(f"\n📈 Performance Metrics:")
print(f"   MAE:  ₹{mae:.2f}")
print(f"   RMSE: ₹{rmse:.2f}")
print(f"   R²:   {r2:.4f}  ({r2*100:.2f}% variance explained)")
print(f"   MAPE: {mape:.2f}%")

# Feature importance
importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(f"\n📊 Feature Importance:")
for _, row in importance.iterrows():
    bar = '█' * int(row['importance'] * 40)
    print(f"   {row['feature']:20s} {row['importance']:.4f}  {bar}")

# Sample predictions
print(f"\n🔍 Sample Predictions vs Actual:")
sample = X_test.head(5)
sample_pred = model.predict(sample)
sample_actual = y_test.head(5).values
for i in range(5):
    print(f"   Predicted: ₹{sample_pred[i]:.0f} | Actual: ₹{sample_actual[i]:.0f} | Diff: ₹{abs(sample_pred[i]-sample_actual[i]):.0f}")

# Save model + encoders
joblib.dump(model, 'pricing_model.pkl')
joblib.dump(le_from, 'le_from.pkl')
joblib.dump(le_to, 'le_to.pkl')

print(f"\n💾 Saved artifacts:")
print(f"   ✅ pricing_model.pkl")
print(f"   ✅ le_from.pkl")
print(f"   ✅ le_to.pkl")

print(f"\n🎯 Model ready for deployment!")
