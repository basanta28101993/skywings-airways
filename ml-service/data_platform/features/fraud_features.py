"""
Fraud Feature Engineering
"""
import pandas as pd
import numpy as np

def add_fraud_features(df: pd.DataFrame) -> pd.DataFrame:
    print("   [Feature] Adding fraud detection features...")
    df = df.copy()
    
    # 1. Country Mismatch (Fraudsters often use foreign IPs)
    df['is_country_mismatch'] = (df['ipCountry'] != df['billingCountry']).astype(int)
    
    # 2. Night Transaction (0-5 AM is suspicious)
    df['is_night_transaction'] = df['bookingHour'].apply(lambda x: 1 if 0 <= x <= 5 else 0)
    
    # 3. High Amount Flag (Amount > 50,000)
    df['is_high_amount'] = (df['amount'] > 50000).astype(int)
    
    # 4. Encode Categorical Variables
    # For simplicity, we map them to numbers (in production, use OneHotEncoder)
    df['deviceType_encoded'] = df['deviceType'].map({'web': 0, 'ios': 1, 'android': 2, 'unknown': 3}).fillna(0)
    df['paymentMethod_encoded'] = df['paymentMethod'].map({'card': 0, 'upi': 1, 'netbanking': 2}).fillna(0)
    
    # 5. Drop columns not needed for ML
    drop_cols = ['id', 'currency', 'createdAt', 'ipCountry', 'billingCountry', 'deviceType', 'paymentMethod']
    df = df.drop(columns=[c for c in drop_cols if c in df.columns])
    
    return df
