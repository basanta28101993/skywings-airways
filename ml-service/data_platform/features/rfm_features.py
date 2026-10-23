"""
RFM Feature Engineering for Customer Segmentation
"""
import pandas as pd
import numpy as np
from datetime import datetime

def create_rfm_features(df: pd.DataFrame) -> pd.DataFrame:
    print("   [Feature] Calculating RFM metrics...")
    df = df.copy()
    
    # Ensure createdAt is datetime
    df['createdAt'] = pd.to_datetime(df['createdAt'])
    
    # Set a reference date (usually today, but using max date in dataset for consistency)
    reference_date = df['createdAt'].max() + pd.Timedelta(days=1)
    
    # 1. Calculate RFM using Pandas groupby
    rfm = df.groupby('passengerEmail').agg({
        'createdAt': lambda x: (reference_date - x.max()).days,  # Recency
        'pnr': 'count',                                          # Frequency
        'totalPrice': 'sum'                                      # Monetary
    }).reset_index()
    
    # Rename columns
    rfm.rename(columns={
        'passengerEmail': 'email',
        'createdAt': 'recency',
        'pnr': 'frequency',
        'totalPrice': 'monetary'
    }, inplace=True)
    
    return rfm
