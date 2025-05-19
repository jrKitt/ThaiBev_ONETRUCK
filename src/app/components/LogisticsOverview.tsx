'use client';

import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import shipmentsData from "../data/shipments.json";
import { FaArrowUp, FaArrowDown, FaBars } from "react-icons/fa";
import { PieChart, Pie, Cell } from "recharts";

// ───────── ORS DIRECTIONS ─────────
async function fetchRoute(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> {
  try {
    const res = await fetch(
      `/api/route?start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`
    );
    if (!res.ok) {
      console.warn(
        `Route fetch failed [${res.status}], falling back to local route`
      );
      return [];
    }
    const json = await res.json();
    return json.features[0].geometry.coordinates.map((c: [number, number]) => [
      c[1],
      c[0],
    ]);
  } catch (e) {
    console.warn("Route fetch exception, falling back to local route", e);
    return [];
  }
}

// ───────── TYPES ─────────
type RegionKey = "north" | "northeast" | "central" | "south";
interface Metric {
  label: string;
  value: number;
  positive: boolean;
}
interface TruckInfo {
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  truckClass: string;
  region: number;
  depot: string;
}
interface Shipment {
  id: string;
  company: "TBL" | "SERMSUK" | "HAVI";
  origin: { name: string; latitude: number; longitude: number };
  destination: { name: string; latitude: number; longitude: number };
  departure_time: string;
  estimated_arrival_time: string;
  distance_km: number;
  estimated_duration_hours: number;
  status: "พร้อมใช้งาน / ว่าง" | "กำลังจัดส่ง" | "ขัดข้อง";
  progress: number;
  orders: { orderId: string; item: string; quantity: number }[];
  route?: { lat: number; lng: number }[];
  truck?: TruckInfo;
}

// ───────── ICONS ─────────
const originIcon = new L.DivIcon({
  html: "🏭",
  className: "",
  iconSize: [16, 16],
  iconAnchor: [16, 16],
});
const destIcon = new L.DivIcon({
  html: "🎯",
  className: "",
  iconSize: [16, 16],
  iconAnchor: [16, 16],
});
function truckIcon(status: Shipment["status"]) {
  const color =
    status === "พร้อมใช้งาน / ว่าง"
      ? "#22C55E"
      : status === "ขัดข้อง"
      ? "#F59E0B"
      : "#EF4444";
  return new L.DivIcon({
    html: `<div style="
      background:${color};
      width:32px;height:32px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid white;
      font-size:18px
    ">🚚</div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// ───────── REGION CARD ─────────
function RegionCard({
  regionName,
  metrics,
  weeklySales,
  totalSales,
  totalChange,
  onClick,
}: {
  regionName: string;
  metrics: Metric[];
  weeklySales: number;
  totalSales: number;
  totalChange: number;
  onClick?: () => void;
}) {
  const COLORS = ["#0066CC", "#0099FF", "#004a94", "#b7dbff"];
  const data = metrics.map((m, i) => ({
    name: m.label,
    value: m.value,
    fill: COLORS[i % COLORS.length],
  }));
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-black"
    >
      <h2 className="text-xl font-bold mb-3">{regionName}</h2>
      <div className="flex">
        <div className="relative w-1/2 flex justify-center items-center">
          <PieChart width={100} height={100}>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={30}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={data[idx].fill} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute text-center">
            <div className="text-lg font-bold">{weeklySales}k</div>
            <div className="text-xs text-gray-500">ยอดรายสัปดาห์</div>
          </div>
        </div>
        <div className="w-1/2 pl-3 space-y-1">
          {metrics.map((m) => (
            <div key={m.label} className="flex justify-between text-sm">
              <span>{m.label}</span>
              <span
                className={`flex items-center ${
                  m.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                {m.positive ? <FaArrowUp /> : <FaArrowDown />}{" "}
                {Math.abs(m.value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t my-4" />
      <div className="flex justify-between">
        <span>ยอดรวม 7 วัน</span>
        <span
          className={`flex items-center ${
            totalChange >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {totalChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}{" "}
          {Math.abs(totalChange).toFixed(1)}%
        </span>
      </div>
    </button>
  );
}

// ───────── MAIN COMPONENT ─────────
export default function LogisticsOverview() {
  const metrics: Metric[] = [
    { label: "กำลังขนส่ง", value: 25.8, positive: true },
    { label: "รอส่งมอบ", value: 4.3, positive: true },
    { label: "ส่งมอบแล้ว", value: -12.5, positive: false },
    { label: "อัตราสำเร็จ", value: 35.6, positive: true },
  ];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<
    "All" | "TBL" | "SERMSUK" | "HAVI"
  >("All");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "พร้อมใช้งาน / ว่าง" | "กำลังจัดส่ง" | "ขัดข้อง"
  >("All");
  const [routes, setRoutes] = useState<Record<string, [number, number][]>>({});
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // **ใหม่**: ข้ามการอัปเดตตำแหน่งใน tick แรก เพื่อไม่ให้รถกระตุกตอนเปิดหน้า
  const [firstTickSkipped, setFirstTickSkipped] = useState(false);

  const shipments: Shipment[] = shipmentsData.shipments;

  // ───────── load / fallback routes ─────────
  useEffect(() => {
    shipments.forEach((s) => {
      if (s.route && s.route.length > 0) {
        const coords = s.route.map((r) => [r.lat, r.lng] as [number, number]);
        setRoutes((r) => ({ ...r, [s.id]: coords }));
        setPositions((p) => ({ ...p, [s.id]: 0 }));
      } else {
        fetchRoute(
          [s.origin.latitude, s.origin.longitude],
          [s.destination.latitude, s.destination.longitude]
        ).then((coords) => {
          setRoutes((r) => ({ ...r, [s.id]: coords }));
          setPositions((p) => ({ ...p, [s.id]: 0 }));
        });
      }
    });
  }, [shipments]);

  // ───────── animate trucks ─────────
//   useEffect(() => {
//     const t = setInterval(() => {
//       if (!firstTickSkipped) {
//         setFirstTickSkipped(true);
//         return;
//       }
//       setPositions((p) => {
//         const next = { ...p };
//         Object.entries(routes).forEach(([id, coords]) => {
//           const i = p[id] || 0;
//           if (i < coords.length - 1) next[id] = i + 1;
//         });
//         return next;
//       });
//     }, 1000);
//     return () => clearInterval(t);
//   }, [routes, firstTickSkipped]);

  // ───────── filters & selection ─────────
  const filtered = shipments
    .filter((s) => companyFilter === "All" || s.company === companyFilter)
    .filter((s) => statusFilter === "All" || s.status === statusFilter);

  const selectedShipment = selectedId
    ? shipments.find((s) => s.id === selectedId) || null
    : null;

  return (
    <div className="min-h-screen flex relative">
      <button
        onClick={() => setDrawerOpen((v) => !v)}
        className="absolute top-4 left-4 z-50 bg-white p-2 rounded shadow-lg text-black"
      >
        <FaBars className="text-2xl" />
      </button>
      <aside
        className={`bg-gray-100 p-4 w-20 space-y-4 overflow-y-auto transition-all duration-300 text-black
             ${
          drawerOpen ? "w-96" : "w-0 overflow-hidden"
        }`}
        style={{ height: "100vh" }}
      >
        {drawerOpen && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-right">
              ภาพรวมภูมิภาค
            </h1>
            {(["north", "northeast", "central", "south"] as RegionKey[]).map(
              (key) => (
                <RegionCard
                  key={key}
                  regionName={
                    {
                      north: "ภาคเหนือ",
                      northeast: "อีสาน",
                      central: "ภาคกลาง",
                      south: "ภาคใต้",
                    }[key]
                  }
                  metrics={metrics}
                  weeklySales={100}
                  totalSales={25980}
                  totalChange={15.6}
                  onClick={() => (window.location.href = `/region/${key}/rdc`)}

                />
              )
            )}
          </>
        )}
      </aside>

      {/* main map */}
      <div className="flex-1">
        {/* filters */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[999] flex space-x-2">
          {["All", "TBL", "SERMSUK", "HAVI"].map((c) => (
            <button
              key={c}
              onClick={() => {
                setCompanyFilter(c as any);
                setStatusFilter("All");
                setSelectedId(null);
              }}
              className={`px-2 py-1 rounded ${
                companyFilter === c
                  ? "bg-gradient-to-r from-[#004E92] via-[#0066CC] to-[#0099FF] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {c === "All" ? "One Logistic" : c}
            </button>
          ))}
        </div>
        {companyFilter !== "All" && (
          <div className="absolute top-16 right-4 bg-white rounded-lg mt-2 shadow-lg p-2 z-[999] flex space-x-2">
            {(["All", "กำลังจัดส่ง", "ขัดข้อง", "พร้อมใช้งาน / ว่าง"] as const).map(
              (s) => {
                const label =
                  s === "All"
                    ? "All Status"
                    : s === "กำลังจัดส่ง"
                    ? "กำลังจัดส่ง"
                    : s === "ขัดข้อง"
                    ? "ขัดข้อง"
                    : "ว่าง";

                const isActive = statusFilter === s;

                const dotColor =
                  s === "กำลังจัดส่ง"
                    ? "bg-red-500"
                    : s === "ขัดข้อง"
                    ? "bg-yellow-500"
                    : s === "พร้อมใช้งาน / ว่าง"
                    ? "bg-green-500"
                    : "bg-gray-400";

                const activeDotColor = isActive ? "bg-white" : dotColor;

                const badgeBg = isActive
                  ? "bg-gradient-to-r from-[#004E92] via-[#0066CC] to-[#0099FF]"
                  : "bg-gray-100";
                const badgeText = isActive ? "text-white" : "text-gray-700";

                return (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setSelectedId(null);
                    }}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full font-medium transition ${badgeBg} ${badgeText}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${activeDotColor}`}
                    ></span>
                    <span className="text-sm">{label}</span>
                  </button>
                );
              }
            )}
          </div>
        )}

        <MapContainer
          center={[13.7367, 100.5232]}
          zoom={7}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* only show selected route if statusFilter is กำลังจัดส่ง */}
          {statusFilter === "กำลังจัดส่ง" &&
            selectedId &&
            routes[selectedId] && (
              <Polyline
                positions={routes[selectedId]!}
                pathOptions={{ color: "#1100ff", weight: 6, opacity: 0.8 }}
              />
            )}

          {/* trucks */}
          {filtered.map((s) => {
            const coords = routes[s.id];
            const idx = positions[s.id] || 0;
            const pos: [number, number] = coords
              ? coords[idx]
              : [s.origin.latitude, s.origin.longitude];
            return (
              <Marker
                key={s.id}
                position={pos}
                icon={truckIcon(s.status)}
                eventHandlers={{
                  click: () => setSelectedId(s.id),
                }}
              >
                <Popup>
                  <strong>{s.id}</strong>
                  <br />
                  Company: {s.company}
                  <br />
                  Status: {s.status}
                  <br />
                  Progress: {s.progress}%<br />
                  Orders:
                  <ul className="list-disc ml-4">
                    {s.orders.map((o) => (
                      <li key={o.orderId}>
                        {o.orderId}: {o.item} ×{o.quantity}
                      </li>
                    ))}
                  </ul>
                </Popup>  
              </Marker>
            );
          })}

          {/* origins & destinations */}
          {filtered.flatMap((s) => [
            <Marker
              key={`${s.id}-o`}
              position={[s.origin.latitude, s.origin.longitude]}
              icon={originIcon}
            >
              <Popup>
                <strong>{s.origin.name}</strong>
              </Popup>
            </Marker>,
            <Marker
              key={`${s.id}-d`}
              position={[s.destination.latitude, s.destination.longitude]}
              icon={destIcon}
            >
              <Popup>
                <strong>{s.destination.name}</strong>
              </Popup>
            </Marker>,
          ])}
        </MapContainer>
      </div>

      {/* right‐side detail panel */}
      <aside
        className={`bg-white p-6 shadow-xl fixed top-0 right-0 h-full w-80 transition-transform duration-300 z-[999] text-black ${
          selectedShipment ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedShipment && (
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-500 hover:text-gray-800 mb-4"
            >
              ✕ Close
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedShipment.id}</h2>
            <p className="mb-1">
              <strong>Company:</strong> {selectedShipment.company}
            </p>
            <p className="mb-1">
              <strong>Status:</strong> {selectedShipment.status}
            </p>
            <p className="mb-1">
              <strong>Progress:</strong> {selectedShipment.progress}%
            </p>
            <p className="mb-1">
              <strong>From:</strong> {selectedShipment.origin.name}
            </p>
            <p className="mb-1">
              <strong>To:</strong> {selectedShipment.destination.name}
            </p>
            <p className="mb-1">
              <strong>Departs:</strong>{" "}
              {new Date(selectedShipment.departure_time).toLocaleString()}
            </p>
            <p className="mb-4">
              <strong>ETA:</strong>{" "}
              {new Date(
                selectedShipment.estimated_arrival_time
              ).toLocaleString()}
            </p>

            {/* NEW: Truck Info */}
            {selectedShipment.truck && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Truck Info</h3>
                <div>
                    
                </div>
                <p><strong>Plate:</strong> {selectedShipment.truck.licensePlate}</p>
                <p><strong>Driver:</strong> {selectedShipment.truck.driverName}</p>
                <p><strong>Phone:</strong> 0{selectedShipment.truck.driverPhone}</p>
                <p><strong>Class:</strong> {selectedShipment.truck.truckClass}</p>
                <p><strong>Depot:</strong> {selectedShipment.truck.depot}</p>
                <p><strong>Region #:</strong> {selectedShipment.truck.region}</p>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold mb-1">Orders:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedShipment.orders.map((o) => (
                  <li key={o.orderId}>
                    <strong>{o.orderId}</strong>: {o.item} ×{o.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1">
                <strong>Distance:</strong>{" "}
                {selectedShipment.distance_km.toFixed(1)} km
              </p>
              <p>
                <strong>Est. Duration:</strong>{" "}
                {selectedShipment.estimated_duration_hours.toFixed(1)} hrs
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
