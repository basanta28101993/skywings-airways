"""
Generate Synthetic System Metrics for Anomaly Detection
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from datetime import datetime
import uuid

DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)
np.random.seed(42)

def generate_data(n_samples=5000):
    print(f"📊 Generating {n_samples} system metrics...")
    
    records = []
    for _ in range(n_samples):
        # 95% chance of being normal, 5% anomaly
        is_anomaly = np.random.rand() < 0.05
        
        if is_anomaly:
            # Anomaly: High CPU, High Memory, High Latency, High Error Rate
            cpu = np.random.uniform(85.0, 99.0)
            memory = np.random.uniform(80.0, 95.0)
            latency = np.random.uniform(500.0, 2000.0)
            error_rate = np.random.uniform(5.0, 30.0)
        else:
            # Normal: Low/Medium CPU, Normal Memory, Low Latency, Low Error Rate
            cpu = np.random.uniform(10.0, 60.0)
            memory = np.random.uniform(20.0, 70.0)
            latency = np.random.uniform(50.0, 200.0)
            error_rate = np.random.uniform(0.0, 1.5)
            
        records.append({
            "id": str(uuid.uuid4()),
            "cpuUsage": round(cpu, 2),
            "memoryUsage": round(memory, 2),
            "latency": round(latency, 2),
            "errorRate": round(error_rate, 2),
            "isAnomaly": bool(is_anomaly),
            "createdAt": datetime.now()
        })
        
    df = pd.DataFrame(records)
    
    print("🧹 Clearing old metrics...")
    with engine.begin() as conn:
        conn.execute(text('DELETE FROM "SystemMetric"'))
        
    print(f"💾 Inserting {len(df)} records into DB...")
    df.to_sql('SystemMetric', engine, if_exists='append', index=False)
    print("✅ System Metrics generated successfully!")

if __name__ == "__main__":
    generate_data()
