"""
Lag and Rolling Window Feature Engineering
This module creates historical look-back features (essential for Time Series).
"""
import pandas as pd

def add_lag_features(df: pd.DataFrame, target_col: str = 'bookings') -> pd.DataFrame:
    """
    Input: DataFrame sorted by date, with 'route' and 'bookings'
    Output: DataFrame with Lag and Rolling features
    """
    print(f"   [Feature] Adding lag & rolling features for '{target_col}'...")
    df = df.copy()
    
    # We MUST sort by route and date so that lag happens correctly within each route
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by=['route', 'date']).reset_index(drop=True)
    
    # Group by route (so DEL-BOM doesn't mix with DEL-NRT)
    grouped = df.groupby('route')
    
    # 1. Lag Features (What happened in the past?)
    lags = [1, 7, 14]  # 1 day ago, 7 days ago, 14 days ago
    for lag in lags:
        df[f'lag_{lag}d'] = grouped[target_col].shift(lag)
        
    # 2. Rolling Window Features (Moving Averages)
    windows = [7, 14]  # 7-day average, 14-day average
    for window in windows:
        df[f'rolling_mean_{window}d'] = grouped[target_col].transform(
            lambda x: x.rolling(window=window, min_periods=1).mean()
        )
        df[f'rolling_std_{window}d'] = grouped[target_col].transform(
            lambda x: x.rolling(window=window, min_periods=1).std()
        )
        
    # Fill NaNs created by shift/rolling for the first few days (using backward fill or 0)
    # For time series, we often use bfill or interpolate, but here we fill with the base value for safety
    df = df.bfill()
    
    return df
