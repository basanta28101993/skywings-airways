"""
Calendar-based Feature Engineering
This module adds date-related features to the dataset.
"""
import pandas as pd
import numpy as np

def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Input: DataFrame with a 'date' column
    Output: DataFrame with added calendar features
    """
    print("   [Feature] Adding calendar features (day, month, weekend, etc.)...")
    df = df.copy()
    
    # Ensure 'date' is datetime type
    df['date'] = pd.to_datetime(df['date'])
    
    # Extract basic time components
    df['day_of_week'] = df['date'].dt.dayofweek  # 0=Monday, 6=Sunday
    df['month'] = df['date'].dt.month
    df['day_of_month'] = df['date'].dt.day
    df['quarter'] = df['date'].dt.quarter
    df['week_of_year'] = df['date'].dt.isocalendar().week.astype(int)
    
    # Weekend flag (1 if Sat/Sun, else 0)
    df['is_weekend_calc'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Cyclical encoding for time features (Important for ML models like Prophet/LightGBM)
    # This helps the model understand that month 12 (Dec) is close to month 1 (Jan)
    df['dow_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['dow_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    
    return df
