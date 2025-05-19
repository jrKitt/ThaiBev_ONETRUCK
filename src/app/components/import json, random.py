import json, random
from datetime import datetime, timedelta

# Define provinces grouped by region
regions = {
    "Central": ["กรุงเทพฯ", "ชลบุรี", "ระยอง", "พิษณุโลก"],
    "North": ["เชียงใหม่", "ลำปาง"],
    "Northeast": ["ขอนแก่น", "อุดรธานี", "สกลนคร", "นครราชสีมา", "อุบลราชธานี"],
    "South": ["หาดใหญ่", "สุราษฎร์ธานี", "ภูเก็ต", "นครศรีธรรมราช"]
}

# Coordinates lookup
coords = {
    "กรุงเทพฯ": (13.7563, 100.5018),
    "ชลบุรี": (13.3611, 100.9838),
    "ระยอง": (12.6819, 101.2455),
    "พิษณุโลก": (16.8205, 100.2656),
    "เชียงใหม่": (18.7883, 98.9853),
    "ลำปาง": (18.2861, 99.5047),
    "ขอนแก่น": (16.4419, 102.8350),
    "อุดรธานี": (17.4156, 102.7850),
    "สกลนคร": (17.1680, 104.1456),
    "นครราชสีมา": (14.9799, 102.0977),
    "อุบลราชธานี": (15.2449, 104.8470),
    "หาดใหญ่": (6.9969, 100.4669),
    "สุราษฎร์ธานี": (9.0397, 99.1715),
    "ภูเก็ต": (7.8804, 98.3923),
    "นครศรีธรรมราช": (8.4316, 99.9686)
}

status_options = ['in_transit', 'available', 'broken']
company_distribution = [("TBL", 450), ("SERMSUK", 450), ("HAVI", 100)]

shipments = []
counter = 1
now = datetime(2025, 5, 19, 6, 0)

for company, total in company_distribution:
    for _ in range(total):
        origin = random.choice(list(coords))
        # Determine origin region
        origin_region = next(r for r, ps in regions.items() if origin in ps)
        # Destination pool based on rule
        if origin_region == "South":
            pool = regions["South"]
        elif origin_region == "Northeast":
            pool = regions["Northeast"]
        else:
            pool = list(coords.keys())
        dest = random.choice([d for d in pool if d != origin])
        
        o_lat, o_lng = coords[origin]
        d_lat, d_lng = coords[dest]
        depart = now + timedelta(hours=random.randint(0, 72))
        duration = round(random.uniform(5, 48), 1)
        arrival = depart + timedelta(hours=duration)
        status = random.choices(status_options, [0.5, 0.3, 0.2])[0]
        progress = random.randint(1, 99) if status == 'in_transit' else 100
        
        # Build route
        route = []
        for i in range(6):
            f = i/5
            lat = o_lat + (d_lat - o_lat)*f + random.uniform(-0.2,0.2)
            lng = o_lng + (d_lng - o_lng)*f + random.uniform(-0.2,0.2)
            route.append({"lat": round(lat,6), "lng": round(lng,6)})
        
        curr_lat = round(o_lat + (d_lat - o_lat)*random.random(),6)
        curr_lng = round(o_lng + (d_lng - o_lng)*random.random(),6)
        orders = [{
            "orderId": f"ORD-{company[:3]}{random.randint(1000,9999)}",
            "item": f"สินค้า {random.choice(['A','B','C','D','E'])}",
            "quantity": random.randint(1,20)
        } for _ in range(random.randint(1,3))]
        
        shipments.append({
            "id": f"{company}-{counter:04d}",
            "company": company,
            "origin": {"name": origin, "latitude": o_lat, "longitude": o_lng},
            "destination": {"name": dest, "latitude": d_lat, "longitude": d_lng},
            "departure_time": depart.isoformat(),
            "estimated_arrival_time": arrival.isoformat(),
            "distance_km": round(random.uniform(50, 1500), 1),
            "estimated_duration_hours": duration,
            "status": status,
            "progress": progress,
            "current_position": {"latitude": curr_lat, "longitude": curr_lng},
            "orders": orders,
            "route": route
        })
        counter += 1
    
# Save to shipments_region_filtered.json
with open('shipments_region_filtered.json', 'w', encoding='utf-8') as f:
    json.dump({"shipments": shipments}, f, ensure_ascii=False, indent=2)
