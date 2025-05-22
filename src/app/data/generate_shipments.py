import random, json, datetime

companies = ['TBL', 'SERMSUK', 'Longtitude']
regions = [
    {"name": "North", "province": [("เชียงใหม่", 18.7883, 98.9853), ("ลำปาง", 18.2868, 99.4981)]},
    {"name": "Central", "province": [("กรุงเทพฯ", 13.7563, 100.5018), ("ชลบุรี", 13.3621, 100.9841)]},
    {"name": "South", "province": [("หาดใหญ่", 6.9969, 100.4669), ("สุราษฎร์ธานี", 9.0397, 99.1715)]},
    {"name": "Northeast", "province": [("ขอนแก่น", 16.4419, 102.8355), ("อุดรธานี", 17.4156, 102.785)]}
]
truck_classes = ['6 ล้อ', '10 ล้อ', '6WB-8PL']
driver_names = ['สมชาย', 'จารุ', 'สุพจน์', 'นายพิทักษ์', 'ชัยพร พลาซี', 'ธีรวัฒน์', 'สมบัติ', 'นเรศ']

def random_orders():
    return [{
        "orderId": f"ORD-TBL{random.randint(1000,9999)}",
        "item": f"สินค้า {random.choice(['A','B','C','D','E'])}",
        "quantity": random.randint(5,30)
    }]

def random_route(origin, dest):
    return [
        {"lat": round(random.uniform(origin[1], dest[1]), 4), "lng": round(random.uniform(origin[2], dest[2]),4)},
        {"lat": round(random.uniform(origin[1], dest[1]), 4), "lng": round(random.uniform(origin[2], dest[2]),4)}
    ]

def random_current_position(origin, dest, status, progress, seed=float('nan')):
    if status == "available":
        # ใกล้ origin
        return {"latitude": origin[1] + random.uniform(-0.01,0.01), "longitude": origin[2] + random.uniform(-0.01,0.01)}
    if status == "broken":
        base_lat = origin[1] + 0.009
        base_lng = origin[2] - 0.005
        # อยู่กลุ่มๆกัน
        return {"latitude": base_lat + random.uniform(-0.003,0.003), "longitude": base_lng + random.uniform(-0.003,0.003)}
    if status == "in_transit":
        # เดินทางตาม progress (0-99)
        lat = origin[1] + (dest[1]-origin[1]) * (progress/100) + random.uniform(-0.01,0.01)
        lng = origin[2] + (dest[2]-origin[2]) * (progress/100) + random.uniform(-0.01,0.01)
        return {"latitude": round(lat, 5), "longitude": round(lng, 5)}

shipments = []

# แจกแจงสถานะแต่ละ block
for i in range(1000):
    if i < 800: status = "in_transit"
    elif i < 900: status = "available"
    else: status = "broken"
    progress = 0 if status != "in_transit" else random.randint(1,99)
    region = random.choice(regions)
    cities = random.sample(region['province'],2)
    origin = cities[0]
    dest = cities[1]
    company = random.choice(companies)
    support_phone = random.choice(['1300-000-1234','1300-000-9101','1300-000-1122'])
    orders = random_orders()
    route = random_route(origin, dest)
    truck = {
        "licensePlate": f"{random.randint(1,9)}กก {random.randint(1000,9999)}",
        "driverName": random.choice(driver_names),
        "driverPhone": f"08{random.randint(10000000,99999999)}",
        "truckClass": random.choice(truck_classes),
        "region": random.randint(1,4),
        "depot": f"RDC {origin[0]}"
    }
    departure = (datetime.datetime.now() + datetime.timedelta(days=random.randint(-3,3))).strftime('%Y-%m-%dT%H:%M:%S')
    arrival = (datetime.datetime.now() + datetime.timedelta(days=random.randint(0,4), hours=random.randint(2,8))).strftime('%Y-%m-%dT%H:%M:%S')
    obj = {
        "id": f"{company}-{i+1:04d}",
        "company": company,
        "support_phone": support_phone,
        "origin": { "name": origin[0], "latitude": origin[1], "longitude": origin[2] },
        "destination": { "name": dest[0], "latitude": dest[1], "longitude": dest[2] },
        "departure_time": departure,
        "estimated_arrival_time": arrival,
        "distance_km": random.randint(100,600),
        "estimated_duration_hours": round(random.uniform(2,10),1),
        "status": status,
        "progress": progress,
        "current_position": random_current_position(origin, dest, status, progress),
        "orders": orders,
        "route": route,
        "truck": truck,
        "region": region['name'],
        "warehouse": f"D{random.randint(1,8)}: RDC {origin[0]}"
    }
    shipments.append(obj)

with open('shipments_1000.json','w', encoding='utf-8') as f:
    json.dump({"shipments": shipments}, f, ensure_ascii=False, indent=2)