"""
SkyWings - Synthetic History Generator using Pandas
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from datetime import datetime, timedelta
import uuid

# Database Connection
DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)

# Routes and base demand
ROUTES = [
    {'from': 'DEL', 'to': 'BOM', 'base_price': 5000, 'base_demand': 120},
    {'from': 'BOM', 'to': 'DEL', 'base_price': 5200, 'base_demand': 115},
    {'from': 'DEL', 'to': 'NRT', 'base_price': 62000, 'base_demand': 45},
    {'from': 'NRT', 'to': 'DEL', 'base_price': 64000, 'base_demand': 40},
    {'from': 'DEL', 'to': 'DXB', 'base_price': 21000, 'base_demand': 100},
    {'from': 'DXB', 'to': 'DEL', 'base_price': 21500, 'base_demand': 95},
    {'from': 'BOM', 'to': 'LHR', 'base_price': 75000, 'base_demand': 30},
]

def generate_data():
    print("🎲 Generating 6 months of history using Pandas...")
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    records = []
    
    for route in ROUTES:
        for date in dates:
            dow = date.dayofweek  # 0=Mon, 6=Sun
            is_weekend = dow >= 5
            
            # Business Logic for Demand (The "Transform" part)
            multiplier = 1.0
            if is_weekend: multiplier += 0.15
            if date.month in [10, 11, 12]: multiplier += 0.20 # Festive season
            
            # Add random noise (±15%)
            noise = np.random.uniform(0.85, 1.15)
            
            bookings = int(route['base_demand'] * multiplier * noise)
            avg_fare = route['base_price'] * (1.0 + (np.random.uniform(-0.1, 0.2)))
            revenue = bookings * avg_fare
            
            records.append({
                'id': str(uuid.uuid4()),
                'date': date.date(),
                'route': f"{route['from']}-{route['to']}",
                'fromCode': route['from'],
                'toCode': route['to'],
                'bookings': bookings,
                'revenue': round(revenue, 2),
                'avgFare': round(avg_fare, 2),
                'cancellations': int(bookings * 0.02),
                'loadFactor': round(np.random.uniform(0.6, 0.95), 2),
                'isWeekend': bool(is_weekend),
                'isHoliday': bool(np.random.rand() < 0.05),
                'holidayName': 'Festival' if np.random.rand() < 0.05 else None,
                'weatherScore': round(np.random.uniform(1, 10), 1),
                'competitorFare': round(avg_fare * np.random.uniform(0.9, 1.1), 2),
                'promotionActive': bool(np.random.rand() < 0.1)
            })
            
    df = pd.DataFrame(records)
    print(f"✅ Generated {len(df)} records using Pandas.")
    
    # Load to PostgreSQL
    print("💾 Inserting into PostgreSQL...")
    df.to_sql('daily_route_metrics', engine, if_exists='append', index=False)
    print("🚀 Data inserted successfully! Check Prisma Studio.")

if __name__ == "__main__":
    generate_data()
