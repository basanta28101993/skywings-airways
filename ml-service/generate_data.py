"""
SkyWings Dynamic Pricing - Synthetic Training Data Generator
Real airline booking patterns simulate করে 10,000 samples generate করে।
"""

import pandas as pd
import numpy as np

np.random.seed(42)

# ============================================================
# ROUTES (23 airports, 73+ directional routes)
# ============================================================
ROUTES = [
    # 🇮🇳 India domestic
    {'from': 'DEL', 'to': 'BOM', 'base_price': 5000, 'distance_km': 1400},
    {'from': 'BOM', 'to': 'DEL', 'base_price': 5200, 'distance_km': 1400},
    {'from': 'DEL', 'to': 'BLR', 'base_price': 6600, 'distance_km': 2150},
    {'from': 'BLR', 'to': 'DEL', 'base_price': 6800, 'distance_km': 2150},
    {'from': 'DEL', 'to': 'GOA', 'base_price': 6200, 'distance_km': 1900},
    {'from': 'GOA', 'to': 'DEL', 'base_price': 6400, 'distance_km': 1900},
    {'from': 'BOM', 'to': 'GOA', 'base_price': 2900, 'distance_km': 590},
    {'from': 'GOA', 'to': 'BOM', 'base_price': 3000, 'distance_km': 590},
    {'from': 'BOM', 'to': 'BLR', 'base_price': 4000, 'distance_km': 980},
    {'from': 'BLR', 'to': 'BOM', 'base_price': 4100, 'distance_km': 980},
    {'from': 'BLR', 'to': 'MAA', 'base_price': 3300, 'distance_km': 350},
    {'from': 'MAA', 'to': 'BLR', 'base_price': 3400, 'distance_km': 350},
    {'from': 'DEL', 'to': 'CCU', 'base_price': 5800, 'distance_km': 1500},
    {'from': 'CCU', 'to': 'DEL', 'base_price': 5900, 'distance_km': 1500},
    {'from': 'BOM', 'to': 'HYD', 'base_price': 4300, 'distance_km': 710},
    {'from': 'HYD', 'to': 'BOM', 'base_price': 4400, 'distance_km': 710},

    # 🇯🇵 Japan domestic
    {'from': 'NRT', 'to': 'KIX', 'base_price': 13500, 'distance_km': 500},
    {'from': 'KIX', 'to': 'NRT', 'base_price': 13700, 'distance_km': 500},
    {'from': 'HND', 'to': 'KIX', 'base_price': 13200, 'distance_km': 400},
    {'from': 'KIX', 'to': 'HND', 'base_price': 13400, 'distance_km': 400},
    {'from': 'NRT', 'to': 'NGO', 'base_price': 12700, 'distance_km': 350},
    {'from': 'NGO', 'to': 'NRT', 'base_price': 12900, 'distance_km': 350},

    # 🇩🇪 Germany domestic
    {'from': 'FRA', 'to': 'BER', 'base_price': 11000, 'distance_km': 435},
    {'from': 'BER', 'to': 'FRA', 'base_price': 11200, 'distance_km': 435},
    {'from': 'FRA', 'to': 'MUC', 'base_price': 9200, 'distance_km': 305},
    {'from': 'MUC', 'to': 'FRA', 'base_price': 9400, 'distance_km': 305},
    {'from': 'FRA', 'to': 'DUS', 'base_price': 10100, 'distance_km': 210},
    {'from': 'DUS', 'to': 'FRA', 'base_price': 10300, 'distance_km': 210},
    {'from': 'BER', 'to': 'MUC', 'base_price': 12000, 'distance_km': 505},
    {'from': 'MUC', 'to': 'BER', 'base_price': 12200, 'distance_km': 505},

    # 🇦🇪 UAE domestic
    {'from': 'DXB', 'to': 'AUH', 'base_price': 260, 'distance_km': 160},
    {'from': 'AUH', 'to': 'DXB', 'base_price': 270, 'distance_km': 160},
    {'from': 'DXB', 'to': 'SHJ', 'base_price': 240, 'distance_km': 30},
    {'from': 'SHJ', 'to': 'DXB', 'base_price': 250, 'distance_km': 30},

    # 🇺🇸 USA domestic
    {'from': 'JFK', 'to': 'LAX', 'base_price': 350, 'distance_km': 3980},
    {'from': 'LAX', 'to': 'JFK', 'base_price': 360, 'distance_km': 3980},
    {'from': 'JFK', 'to': 'SFO', 'base_price': 380, 'distance_km': 4150},
    {'from': 'SFO', 'to': 'JFK', 'base_price': 390, 'distance_km': 4150},
    {'from': 'LAX', 'to': 'SFO', 'base_price': 150, 'distance_km': 560},
    {'from': 'SFO', 'to': 'LAX', 'base_price': 155, 'distance_km': 560},

    # 🇧🇩 Bangladesh domestic
    {'from': 'DAC', 'to': 'CGP', 'base_price': 6600, 'distance_km': 220},
    {'from': 'CGP', 'to': 'DAC', 'base_price': 6800, 'distance_km': 220},

    # 🌏 India ↔ Japan
    {'from': 'DEL', 'to': 'NRT', 'base_price': 62000, 'distance_km': 5870},
    {'from': 'NRT', 'to': 'DEL', 'base_price': 64000, 'distance_km': 5870},
    {'from': 'BOM', 'to': 'NRT', 'base_price': 65000, 'distance_km': 6730},
    {'from': 'NRT', 'to': 'BOM', 'base_price': 67000, 'distance_km': 6730},
    {'from': 'BLR', 'to': 'NRT', 'base_price': 68000, 'distance_km': 6900},
    {'from': 'NRT', 'to': 'BLR', 'base_price': 70000, 'distance_km': 6900},

    # 🌏 India ↔ Germany
    {'from': 'DEL', 'to': 'FRA', 'base_price': 58000, 'distance_km': 6100},
    {'from': 'FRA', 'to': 'DEL', 'base_price': 60000, 'distance_km': 6100},
    {'from': 'BOM', 'to': 'FRA', 'base_price': 60000, 'distance_km': 6570},
    {'from': 'FRA', 'to': 'BOM', 'base_price': 62000, 'distance_km': 6570},

    # 🌏 India ↔ UAE
    {'from': 'DEL', 'to': 'DXB', 'base_price': 21000, 'distance_km': 2190},
    {'from': 'DXB', 'to': 'DEL', 'base_price': 21500, 'distance_km': 2190},
    {'from': 'BOM', 'to': 'DXB', 'base_price': 19000, 'distance_km': 1930},
    {'from': 'DXB', 'to': 'BOM', 'base_price': 19500, 'distance_km': 1930},
    {'from': 'BLR', 'to': 'DXB', 'base_price': 20000, 'distance_km': 2930},
    {'from': 'DXB', 'to': 'BLR', 'base_price': 20500, 'distance_km': 2930},
    {'from': 'MAA', 'to': 'AUH', 'base_price': 20000, 'distance_km': 2980},
    {'from': 'AUH', 'to': 'MAA', 'base_price': 20500, 'distance_km': 2980},

    # 🌏 India ↔ USA
    {'from': 'DEL', 'to': 'JFK', 'base_price': 79000, 'distance_km': 11790},
    {'from': 'JFK', 'to': 'DEL', 'base_price': 81000, 'distance_km': 11790},
    {'from': 'BOM', 'to': 'JFK', 'base_price': 81000, 'distance_km': 12560},
    {'from': 'JFK', 'to': 'BOM', 'base_price': 83000, 'distance_km': 12560},
    {'from': 'BLR', 'to': 'SFO', 'base_price': 87000, 'distance_km': 14000},
    {'from': 'SFO', 'to': 'BLR', 'base_price': 89000, 'distance_km': 14000},

    # 🌏 India ↔ Bangladesh
    {'from': 'DEL', 'to': 'DAC', 'base_price': 15000, 'distance_km': 1440},
    {'from': 'DAC', 'to': 'DEL', 'base_price': 15500, 'distance_km': 1440},
    {'from': 'CCU', 'to': 'DAC', 'base_price': 10000, 'distance_km': 250},
    {'from': 'DAC', 'to': 'CCU', 'base_price': 10200, 'distance_km': 250},

    # 🌏 Japan ↔ Germany
    {'from': 'NRT', 'to': 'FRA', 'base_price': 150000, 'distance_km': 9370},
    {'from': 'FRA', 'to': 'NRT', 'base_price': 153000, 'distance_km': 9370},
    {'from': 'HND', 'to': 'MUC', 'base_price': 153000, 'distance_km': 9280},
    {'from': 'MUC', 'to': 'HND', 'base_price': 155000, 'distance_km': 9280},

    # 🌏 Japan ↔ UAE
    {'from': 'NRT', 'to': 'DXB', 'base_price': 127000, 'distance_km': 7920},
    {'from': 'DXB', 'to': 'NRT', 'base_price': 130000, 'distance_km': 7920},

    # 🌏 Japan ↔ USA
    {'from': 'NRT', 'to': 'JFK', 'base_price': 180000, 'distance_km': 10850},
    {'from': 'JFK', 'to': 'NRT', 'base_price': 183000, 'distance_km': 10850},
    {'from': 'HND', 'to': 'LAX', 'base_price': 165000, 'distance_km': 8800},
    {'from': 'LAX', 'to': 'HND', 'base_price': 168000, 'distance_km': 8800},

    # 🌏 Germany ↔ UAE
    {'from': 'FRA', 'to': 'DXB', 'base_price': 2400, 'distance_km': 4820},
    {'from': 'DXB', 'to': 'FRA', 'base_price': 2500, 'distance_km': 4820},

    # 🌏 Germany ↔ USA
    {'from': 'FRA', 'to': 'JFK', 'base_price': 550, 'distance_km': 6200},
    {'from': 'JFK', 'to': 'FRA', 'base_price': 570, 'distance_km': 6200},
    {'from': 'FRA', 'to': 'LAX', 'base_price': 790, 'distance_km': 9310},
    {'from': 'LAX', 'to': 'FRA', 'base_price': 810, 'distance_km': 9310},

    # 🌏 UAE ↔ USA
    {'from': 'DXB', 'to': 'JFK', 'base_price': 900, 'distance_km': 11000},
    {'from': 'JFK', 'to': 'DXB', 'base_price': 920, 'distance_km': 11000},

    # 🌏 USA ↔ Bangladesh
    {'from': 'JFK', 'to': 'DAC', 'base_price': 1100, 'distance_km': 12500},
    {'from': 'DAC', 'to': 'JFK', 'base_price': 1130, 'distance_km': 12500},

    # 🌏 UAE ↔ Bangladesh
    {'from': 'DXB', 'to': 'DAC', 'base_price': 39000, 'distance_km': 3540},
    {'from': 'DAC', 'to': 'DXB', 'base_price': 39500, 'distance_km': 3540},
    {'from': 'SHJ', 'to': 'CGP', 'base_price': 38500, 'distance_km': 3670},
    {'from': 'CGP', 'to': 'SHJ', 'base_price': 38700, 'distance_km': 3670},
]


# ============================================================
# Dynamic pricing logic (এই rules ML model learn করবে)
# ============================================================
def calculate_dynamic_price(base_price, days_until, hour, dow, seats, is_holiday):
    """
    Realistic dynamic pricing logic — যা ML model learn করবে।
    """
    multiplier = 1.0

    # 1. Days until flight (last-minute premium)
    if days_until <= 3:
        multiplier += 0.50   # +50%
    elif days_until <= 7:
        multiplier += 0.35   # +35%
    elif days_until <= 14:
        multiplier += 0.20   # +20%
    elif days_until <= 30:
        multiplier += 0.10   # +10%

    # 2. Peak hours
    if 6 <= hour <= 9:
        multiplier += 0.15
    elif 17 <= hour <= 21:
        multiplier += 0.18
    elif 0 <= hour <= 5:
        multiplier -= 0.10   # Red-eye discount

    # 3. Day of week
    if dow in [5, 6]:        # Sat, Sun
        multiplier += 0.12
    elif dow in [1, 4]:      # Tue, Fri
        multiplier += 0.05

    # 4. Seat scarcity
    if seats <= 10:
        multiplier += 0.35
    elif seats <= 20:
        multiplier += 0.25
    elif seats <= 50:
        multiplier += 0.10
    elif seats >= 130:
        multiplier -= 0.05   # Empty flight discount

    # 5. Holiday premium
    if is_holiday:
        multiplier += 0.30

    # 6. Random noise (±3%)
    multiplier += np.random.normal(0, 0.03)

    # Floor multiplier at 0.85
    multiplier = max(0.85, multiplier)

    return round(base_price * multiplier, 2)


# ============================================================
# Generate training data
# ============================================================
print("🎲 Generating synthetic booking data...")
print(f"   Routes: {len(ROUTES)}")
print(f"   Target samples: 10,000")
print("")

n_samples = 10000
data = []

for i in range(n_samples):
    route = ROUTES[np.random.randint(0, len(ROUTES))]

    # Random features
    days_until = int(np.random.choice(
        [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90],
        p=[0.03, 0.05, 0.07, 0.08, 0.08, 0.10, 0.12, 0.12, 0.13, 0.08, 0.07, 0.07]
    ))
    hour = int(np.random.randint(0, 24))
    dow = int(np.random.randint(0, 7))
    seats = int(np.random.randint(1, 400))
    is_holiday = 1 if np.random.random() < 0.12 else 0
    is_weekend = 1 if dow in [5, 6] else 0

    # Calculate dynamic price
    final_price = calculate_dynamic_price(
        route['base_price'], days_until, hour, dow, seats, is_holiday
    )

    price_multiplier = final_price / route['base_price']

    data.append({
        'from_code': route['from'],
        'to_code': route['to'],
        'base_price': route['base_price'],
        'distance_km': route['distance_km'],
        'days_until_flight': days_until,
        'departure_hour': hour,
        'day_of_week': dow,
        'seats_available': seats,
        'is_weekend': is_weekend,
        'is_holiday': is_holiday,
        'final_price': final_price,
        'price_multiplier': round(price_multiplier, 3),
    })

# Save
df = pd.DataFrame(data)
df.to_csv('training_data.csv', index=False)

# ============================================================
# Summary
# ============================================================
print(f"✅ Generated {len(df)} samples")
print(f"\n📊 Data Summary:")
print(f"   Base price range:  ₹{df['base_price'].min()} - ₹{df['base_price'].max()}")
print(f"   Final price range: ₹{df['final_price'].min():.0f} - ₹{df['final_price'].max():.0f}")
print(f"   Avg multiplier:    {df['price_multiplier'].mean():.3f}")
print(f"   Max multiplier:    {df['price_multiplier'].max():.3f}")

print(f"\n🔤 Unique airports in data:")
airports_from = sorted(df['from_code'].unique())
airports_to = sorted(df['to_code'].unique())
print(f"   From ({len(airports_from)}): {airports_from}")
print(f"   To ({len(airports_to)}): {airports_to}")

print(f"\n📈 Avg Multiplier by Days Until Flight:")
df['days_bucket'] = pd.cut(
    df['days_until_flight'],
    bins=[0, 7, 30, 100],
    labels=['Last-minute (≤7d)', 'Mid (8-30d)', 'Early (>30d)']
)
print(df.groupby('days_bucket', observed=True)['price_multiplier'].mean())

print(f"\n📁 Saved: training_data.csv")
