"""
Generate Synthetic Customer Booking History for Segmentation (RFM)
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
import uuid

DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)
np.random.seed(42)

def generate_data(num_customers=1000):
    print(f"👥 Generating booking history for {num_customers} customers...")
    
    # Get an existing flight ID to link bookings
    with engine.connect() as conn:
        result = conn.execute(text('SELECT id, "basePrice" FROM "Flight" LIMIT 1')).fetchone()
        if not result:
            print("❌ No flights found in DB. Please run the flight seed first.")
            return
        flight_id, base_price = result[0], float(result[1])

    records = []
    now = datetime.now()

    for i in range(num_customers):
        email = f"customer{i}@example.com"
        
        # Create 3 distinct customer personas
        persona = np.random.choice(['Business', 'Budget', 'Family'], p=[0.2, 0.5, 0.3])
        
        if persona == 'Business':
            # Books frequently, recently, high spend
            num_bookings = np.random.randint(10, 30)
            days_ago_last = np.random.randint(1, 10)
            price_multiplier = np.random.uniform(1.5, 3.0) # Business class prices
        elif persona == 'Budget':
            # Books occasionally, moderately recent, low spend
            num_bookings = np.random.randint(1, 5)
            days_ago_last = np.random.randint(10, 90)
            price_multiplier = np.random.uniform(0.5, 1.0)
        else: # Family
            # Books rarely (but multiple seats), long ago, medium-high spend
            num_bookings = np.random.randint(2, 6)
            days_ago_last = np.random.randint(30, 180)
            price_multiplier = np.random.uniform(1.0, 2.0)

        # Generate bookings for this customer
        for b in range(num_bookings):
            # Spread the bookings out
            days_ago = days_ago_last + (b * np.random.randint(5, 20))
            booking_date = now - timedelta(days=days_ago)
            
            total_price = base_price * price_multiplier * np.random.uniform(0.9, 1.1)
            
            records.append({
                'id': str(uuid.uuid4()),
                'pnr': f"PNR{uuid.uuid4().hex[:10].upper()}",
                'flightId': flight_id,
                'passengerName': f"User {i}",
                'passengerEmail': email,
                'passengerPhone': '+919999999999',
                'totalPrice': round(total_price, 2),
                'currency': 'INR',
                'status': 'CONFIRMED',
                'createdAt': booking_date
            })

    df = pd.DataFrame(records)
    
    print("🧹 Clearing old bookings...")
    with engine.begin() as conn:
        conn.execute(text('DELETE FROM "Booking"'))
        
    print(f"💾 Inserting {len(df)} bookings into DB...")
    df.to_sql('Booking', engine, if_exists='append', index=False)
    print("✅ Customer history generated successfully!")

if __name__ == "__main__":
    generate_data()
