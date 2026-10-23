"""
Data Pipeline Orchestrator
Runs the complete ETL pipeline: Extract -> Transform -> Load
"""
import os
import pandas as pd
from data_platform.extract.from_postgres import extract_daily_metrics
from data_platform.features.calendar_features import add_calendar_features
from data_platform.features.lag_features import add_lag_features

def run_pipeline():
    print("🚀 Starting Data Pipeline...")
    
    # 1. EXTRACT
    df = extract_daily_metrics()
    
    # 2. TRANSFORM (Feature Engineering)
    print("\n🔧 Starting Feature Engineering...")
    df = add_calendar_features(df)
    df = add_lag_features(df)
    
    # Drop columns that are no longer needed for ML (like IDs, holiday names)
    cols_to_drop = ['id', 'holidayName', 'createdAt', 'updatedAt']
    df = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
    
    # 3. LOAD (Save to Feature Store)
    print("\n💾 Saving to Feature Store (Offline)...")
    os.makedirs("feature_store/offline", exist_ok=True)
    output_path = "feature_store/offline/features_v1.parquet"
    
    # Save as Parquet (much faster and smaller than CSV)
    df.to_parquet(output_path, index=False)
    
    print(f"\n✅ Pipeline Complete!")
    print(f"   - Total Rows: {len(df)}")
    print(f"   - Total Features (Columns): {len(df.columns)}")
    print(f"   - Saved to: {output_path}")

if __name__ == "__main__":
    run_pipeline()
