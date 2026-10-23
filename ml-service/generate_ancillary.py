"""
Generate Synthetic Ancillary Purchase Data for Recommendation System
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from datetime import datetime
import uuid

DB_URL = "postgresql+psycopg2://skywings:skywings_dev_password@localhost:5432/skywings_db"
engine = create_engine(DB_URL)
np.random.seed(42)

def generate_data():
    print("🎒 Generating Ancillary Items and Purchases...")
    
    # 1. Create Ancillary Items
    items = [
        {"id": str(uuid.uuid4()), "name": "Extra 10kg Baggage", "category": "baggage", "price": 1500.00},
        {"id": str(uuid.uuid4()), "name": "Premium Meal", "category": "meal", "price": 800.00},
        {"id": str(uuid.uuid4()), "name": "Airport Lounge Access", "category": "lounge", "price": 2500.00},
        {"id": str(uuid.uuid4()), "name": "Travel Insurance", "category": "insurance", "price": 1200.00},
    ]
    df_items = pd.DataFrame(items)
    
    print("🧹 Clearing old ancillary data...")
    with engine.begin() as conn:
        conn.execute(text('DELETE FROM "AncillaryPurchase"'))
        conn.execute(text('DELETE FROM "AncillaryItem"'))
        
    print("💾 Inserting Ancillary Items...")
    df_items.to_sql('AncillaryItem', engine, if_exists='append', index=False)
    
    # 2. Get Bookings to link purchases
    df_bookings = pd.read_sql('SELECT id as "bookingId", "passengerEmail", "totalPrice" FROM "Booking"', engine)
    
    purchases = []
    
    for _, booking in df_bookings.iterrows():
        # Determine how many items the user buys (0 to 3)
        # We'll add a slight bias: high ticket price = more likely to buy lounge
        num_items = np.random.choice([0, 1, 2, 3], p=[0.4, 0.4, 0.15, 0.05])
        
        if num_items == 0:
            continue
            
        # Pick random items for this booking
        bought_items = df_items.sample(n=num_items)
        
        for _, item in bought_items.iterrows():
            # Bias logic for realism:
            # If booking is expensive, they might buy lounge. If cheap, they buy baggage.
            if float(booking['totalPrice']) > 50000 and item['category'] == 'lounge':
                pass # Business travelers buy lounge
            elif float(booking['totalPrice']) < 10000 and item['category'] == 'baggage':
                pass # Budget travelers buy extra baggage
                
            qty = np.random.choice([1, 1, 1, 2]) # Mostly 1, sometimes 2
            
            purchases.append({
                "id": str(uuid.uuid4()),
                "bookingId": booking['bookingId'],
                "itemId": item['id'],
                "quantity": qty,
                "totalPrice": round(item['price'] * qty, 2),
                "createdAt": datetime.now()
            })

    df_purchases = pd.DataFrame(purchases)
    print(f"💾 Inserting {len(df_purchases)} Ancillary Purchases...")
    df_purchases.to_sql('AncillaryPurchase', engine, if_exists='append', index=False)
    
    print("✅ Ancillary Data generated successfully!")

if __name__ == "__main__":
    generate_data()
