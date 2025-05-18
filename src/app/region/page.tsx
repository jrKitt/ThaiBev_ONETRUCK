// app/region/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PieChart, Pie, Cell } from 'recharts';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

// --- Types ---
type RegionKey = 'north' | 'northeast' | 'central' | 'south';

type Vehicle = {
  id: string;
  destination: string;
  customer: string;
  progress: number;
  route: [number, number][];
  routeIndex: number;
};

interface Metric {
  label: string;
  value: number;
  positive: boolean;
}

// --- Mock Data ---
const regionData: Record<RegionKey, { label: string; rdcs: string[] }> = {
  north: {
    label: 'ภาคเหนือ',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
  northeast: {
    label: 'ภาคตะวันออกเฉียงเหนือ',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
  central: {
    label: 'ภาคกลาง',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
  south: {
    label: 'ภาคใต้',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
};

const initialVehicles: Vehicle[] = [
  {
    id: "VOL-000001",
    destination: "โรงพยาบาลกรุงเทพ",
    customer: "คุณชัย",
    progress: 48,
    route: [
      [13.7365, 100.5328],
      [13.75, 100.538],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000002",
    destination: "ศูนย์กระจายสินค้าอุดรธานี",
    customer: "คุณปิยะ",
    progress: 87,
    route: [
      [17.41, 102.78],
      [17.412, 102.785],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000003",
    destination: "คลังสินค้าเชียงใหม่",
    customer: "คุณอุษา",
    progress: 23,
    route: [
      [18.7883, 98.9853],
      [18.789, 98.987],
      [18.79, 98.99],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000004",
    destination: "ศูนย์ขนส่งขอนแก่น",
    customer: "คุณสมหญิง",
    progress: 64,
    route: [
      [16.4309, 102.8236],
      [16.435, 102.83],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000005",
    destination: "โรงงานระยอง",
    customer: "คุณกมล",
    progress: 92,
    route: [
      [12.6788, 101.2423],
      [12.68, 101.245],
      [12.685, 101.25],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000006",
    destination: "คลังสินค้าสุพรรณบุรี",
    customer: "คุณวิทวัส",
    progress: 15,
    route: [
      [14.4747, 100.4361],
      [14.48, 100.44],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000007",
    destination: "ศูนย์กระจายสินค้าภูเก็ต",
    customer: "คุณนิรันดร์",
    progress: 77,
    route: [
      [7.9519, 98.3381],
      [7.96, 98.34],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000008",
    destination: "คลังสินค้าหาดใหญ่",
    customer: "คุณสมปอง",
    progress: 34,
    route: [
      [6.9931, 100.4757],
      [7.0, 100.48],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000009",
    destination: "โรงงานสมุทรปราการ",
    customer: "คุณปวีณา",
    progress: 55,
    route: [
      [13.5991, 100.5967],
      [13.605, 100.6],
    ],
    routeIndex: 0,
  },
  {
    id: "VOL-000010",
    destination: "คลังสินค้าเชียงใหม่",
    customer: "คุณสมชาย",
    progress: 40,
    route: [
      [18.7883, 98.9853],
      [18.79, 98.99],
    ],
    routeIndex: 0,
  },
  // ... เติมให้ครบ 50 รายการตามแบบด้านบน ...
];

// --- Helpers ---
function getStatusColor(progress: number) {
  if (progress >= 80) return '#22C55E'; // เขียว
  if (progress >= 50) return '#F59E0B'; // เหลือง
  return '#EF4444'; // แดง
}

function createTruckIcon(progress: number) {
  const color = getStatusColor(progress);
  const html = `<div style="
    background:${color};
    width:32px;height:32px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    border:2px solid white;
    font-size:18px;
  ">🚚</div>`;
  return new L.DivIcon({
    html,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// --- MapMarkers Component ---
function MapMarkers({
  vehicles,
  onSelect,
}: {
  vehicles: Vehicle[];
  onSelect: (v: Vehicle) => void;
}) {
  const map = useMap();
  return (
    <>
      {vehicles.map((v) => (
        <Marker
          key={v.id}
          position={v.route[v.routeIndex]}
          icon={createTruckIcon(v.progress)}
          eventHandlers={{
            click: () => {
              map.flyTo(v.route[v.routeIndex], 10, { animate: true });
              onSelect(v);
            },
          }}
        >
          <Popup>
            <strong>{v.id}</strong>
            <br />
            ปลายทาง: {v.destination}
            <br />
            ลูกค้า: {v.customer}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// --- RegionCard Component ---
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
  const DONUT_COLORS = ['#0066CC', '#0099FF', '#004a94', '#b7dbff'];
  const pieData = metrics.map((m, i) => ({
    name: m.label,
    value: m.value,
    fill: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-3">{regionName}</h2>
      <div className="flex">
        <div className="relative w-1/2 flex justify-center items-center">
          <PieChart width={100} height={100}>
            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={30}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={pieData[idx].fill} />
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
              <span className="text-gray-700">{m.label}</span>
              <span
                className={`flex items-center font-medium ${
                  m.positive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {m.positive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {Math.abs(m.value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 my-4" />
      <div>
        <div className="text-gray-600 text-sm">ยอดรวม 7 วัน</div>
        <div className="flex items-baseline mt-2">
          <span className="text-xl font-bold">${totalSales.toLocaleString()}</span>
          <span
            className={`ml-2 flex items-center text-sm font-medium ${
              totalChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {totalChange >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(totalChange).toFixed(1)}%
          </span>
        </div>
      </div>
    </button>
  );
}

// --- Main Page Component ---
export default function RegionWithFleet() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);
  const [search, setSearch] = useState('');

  // จำลองรถวิ่งแบบ realtime
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles((vs) =>
        vs.map((v) => ({
          ...v,
          routeIndex: (v.routeIndex + 1) % v.route.length,
        }))
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filtered = vehicles.filter((v) =>
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  // Mock metrics สำหรับการ์ด
  const metrics: Metric[] = [
    { label: 'กำลังขนส่ง', value: 25.8, positive: true },
    { label: 'รอส่งมอบ', value: 4.3, positive: true },
    { label: 'ส่งมอบแล้ว', value: -12.5, positive: false },
    { label: 'อัตราความสำเร็จส่งมอบ', value: 35.6, positive: true },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ฝั่งซ้าย: แผนที่ */}
      <div className="flex-1 bg-[#EFF6FF] p-3">
        <MapContainer
          center={[13.7367, 100.5232]}
          zoom={6}
          bounds={[[5, 97], [21, 106]]}
          maxBounds={[[5, 97], [21, 106]]}
          maxBoundsViscosity={1}
          style={{ height: 'calc(100vh - 1rem)', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <MapMarkers vehicles={filtered} onSelect={() => {}} />
        </MapContainer>
      </div>

      {/* ฝั่งขวา: เลือกภูมิภาค / เลือก RDC */}
      <div className="w-full md:w-96 bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-center mb-4">ภาพรวมภูมิภาค</h1>
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2">
          {selectedRegion === null ? (
            // แสดงการ์ดภูมิภาคทั้งหมด
            (Object.entries(regionData) as [RegionKey, any][]).map(([key, { label }]) => (
              <RegionCard
                key={key}
                regionName={label}
                metrics={metrics}
                weeklySales={100}
                totalSales={25980}
                totalChange={15.6}
                onClick={() => window.location.href = `/region/${key}/rdc`}
              />
            ))
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← กลับไปเลือกภูมิภาค
              </button>
              <h2 className="text-xl font-semibold mb-2 text-center">
                {regionData[selectedRegion].label} – เลือก RDC
              </h2>
              {regionData[selectedRegion].rdcs.map((rdc) => (
                <button
                  key={rdc}
                  onClick={() => {
                    window.location.href = '/Dashboard';
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#0099FF] via-[#0066CC] to-[#004E92] text-white rounded-lg shadow-lg hover:opacity-90 transition"
                >
                  {rdc}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
