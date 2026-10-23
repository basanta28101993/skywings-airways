"""
Extract Data from PostgreSQL
"""
import pandas as pd
from sqlalchemy import create_engine

def extract_daily_metrics() -> pd.DataFrame:
    print("   [Extract] Pulling data from PostgreSQL (daily_route_metrics)...")
    
    # Use psycopg2 driver explicitly
    DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
    engine = create_engine(DB_URL)
    
    # Read data using SQL query
    query = "SELECT * FROM daily_route_metrics ORDER BY date ASC"
    df = pd.read_sql(query, engine)
    
    print(f"   [Extract] Loaded {len(df)} rows.")
    return df
