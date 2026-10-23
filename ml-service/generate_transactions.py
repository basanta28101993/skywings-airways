import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from datetime import datetime
import uuid

DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)

np.random.seed(42)

def generate_data(n_samples=10000):
    print(f"💳 Generating {n_samples} transactions (with realistic noise)...")
    records = []
    
    for _ in range(n_samples):
        is_fraud = np.random.rand() < 0.05  # 5% fraud
        
        # Base profile
        amount = np.random.uniform(500, 60000)
        ip_country = 'IN'
        billing_country = 'IN'
        device_type = np.random.choice(['web', 'ios', 'android'])
        payment_method = np.random.choice(['card', 'upi', 'netbanking'])
        booking_hour = np.random.randint(0, 24)
        
        if is_fraud:
            # Fraudsters try to mix in, but sometimes leave clues
            if np.random.rand() < 0.6: # 60% of frauds are obvious
                amount = np.random.uniform(50000, 200000)
                booking_hour = np.random.randint(0, 5)
                ip_country = np.random.choice(['US', 'RU', 'NG', 'BR', 'CN'])
                device_type = 'unknown'
            else: # 40% of frauds are sneaky (hard for model to catch)
                amount = np.random.uniform(1000, 45000)
                ip_country = np.random.choice(['IN', 'US'])
                booking_hour = np.random.randint(6, 23)
                
            # Sometimes legitimate users trigger fraud alerts (False Positives)
        else:
            if np.random.rand() < 0.02: # 2% of genuine users have weird behavior
                amount = np.random.uniform(60000, 150000)
                ip_country = np.random.choice(['US', 'AE'])
                booking_hour = np.random.randint(0, 5)

        records.append({
            'id': str(uuid.uuid4()),
            'amount': round(amount, 2),
            'currency': 'INR',
            'paymentMethod': payment_method,
            'ipCountry': ip_country,
            'billingCountry': billing_country,
            'deviceType': device_type,
            'bookingHour': booking_hour,
            'isFraud': bool(is_fraud),
            'createdAt': datetime.now()
        })
        
    df = pd.DataFrame(records)
    
    print("🧹 Clearing old transactions...")
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM \"Transaction\""))
        
    print("💾 Inserting to database...")
    df.to_sql('Transaction', engine, if_exists='append', index=False)
    print("✅ Realistic transactions generated successfully!")

if __name__ == "__main__":
    generate_data()
