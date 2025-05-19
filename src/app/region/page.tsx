"use client";
import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import shipmentsData from '../data/shipments.json';
import { FaArrowUp, FaArrowDown, FaBars } from 'react-icons/fa';
import { PieChart, Pie, Cell } from 'recharts';

// ───────── ORS DIRECTIONS ─────────
const ORS_API_KEY = '5b3ce3597851110001cf62486ad9702ed2284c3e9501eca8456c076c';
async function fetchRoute(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> {
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
  const params = new URLSearchParams({
    start: `${start[1]},${start[0]}`,
    end: `${end[1]},${end[0]}`,
  });
  const res = await fetch(`${url}?${params}`, {
    headers: { Authorization: ORS_API_KEY },
  });
  const json = await res.json();
  return json.features[0].geometry.coordinates.map(
    (c: [number, number]) => [c[1], c[0]]
  );
}

// ───────── TYPES ─────────
type RegionKey = 'north' | 'northeast' | 'central' | 'south';
interface Metric { label: string; value: number; positive: boolean; }
interface Shipment {
  id: string;
  company: 'TBL' | 'SERMSUK' | 'HAVI';
  origin:      { name: string; latitude: number; longitude: number };
  destination: { name: string; latitude: number; longitude: number };
  departure_time: string;
  estimated_arrival_time: string;
  distance_km: number;
  estimated_duration_hours: number;
  status: 'available' | 'in_transit' | 'broken';
  progress: number;
  orders: { orderId: string; item: string; quantity: number }[];
}

// ───────── ICONS ─────────
const originIcon = new L.DivIcon({ html: '🏭', className: '', iconSize: [32,32], iconAnchor: [16,16] });
const destIcon   = new L.DivIcon({ html: '🎯', className: '', iconSize: [32,32], iconAnchor: [16,16] });
function truckIcon(status: Shipment['status']) {
  const color =
    status === 'available' ? '#22C55E' :
    status === 'broken'    ? '#F59E0B' :
    /* in_transit */       '#EF4444';
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
    className: '',
    iconSize: [32,32],
    iconAnchor: [16,16],
    popupAnchor: [0,-16],
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
  const COLORS = ['#0066CC','#0099FF','#004a94','#b7dbff'];
  const data = metrics.map((m,i) => ({ name:m.label, value:m.value, fill:COLORS[i%COLORS.length] }));
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
    >
      <h2 className="text-xl font-bold mb-3">{regionName}</h2>
      <div className="flex">
        <div className="relative w-1/2 flex justify-center items-center">
          <PieChart width={100} height={100}>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={30} outerRadius={45}
              startAngle={90} endAngle={-270}
              paddingAngle={2}
            >
              {data.map((_,idx)=><Cell key={idx} fill={data[idx].fill}/>)}
            </Pie>
          </PieChart>
          <div className="absolute text-center">
            <div className="text-lg font-bold">{weeklySales}k</div>
            <div className="text-xs text-gray-500">ยอดรายสัปดาห์</div>
          </div>
        </div>
        <div className="w-1/2 pl-3 space-y-1">
          {metrics.map(m=>(
            <div key={m.label} className="flex justify-between text-sm">
              <span>{m.label}</span>
              <span className={`flex items-center ${m.positive?'text-green-500':'text-red-500'}`}>
                {m.positive? <FaArrowUp/>:<FaArrowDown/>} {Math.abs(m.value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t my-4"/>
      <div className="flex justify-between">
        <span>ยอดรวม 7 วัน</span>
        <span className={`flex items-center ${totalChange>=0?'text-green-500':'text-red-500'}`}>
          {totalChange>=0?<FaArrowUp/>:<FaArrowDown/>} {Math.abs(totalChange).toFixed(1)}%
        </span>
      </div>
    </button>
  );
}

// ───────── MAIN COMPONENT ─────────
export default function LogisticsOverview() {
  const metrics: Metric[] = [
    { label:'กำลังขนส่ง', value:25.8, positive:true },
    { label:'รอส่งมอบ',   value:4.3,  positive:true },
    { label:'ส่งมอบแล้ว',value:-12.5,positive:false},
    { label:'อัตราสำเร็จ',value:35.6, positive:true },
  ];

  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [companyFilter, setCompanyFilter] = useState<'All'|'TBL'|'SERMSUK'|'HAVI'>('All');
  const [statusFilter, setStatusFilter]   = useState<'All'|'available'|'in_transit'|'broken'>('All');
  const [routes, setRoutes]               = useState<Record<string,[number,number][]>>({});
  const [positions, setPositions]         = useState<Record<string,number>>({});
  const shipments: Shipment[]             = shipmentsData.shipments;

  // fetch ORS routes once
  useEffect(() => {
    shipments.forEach(s=>{
      fetchRoute(
        [s.origin.latitude, s.origin.longitude],
        [s.destination.latitude, s.destination.longitude]
      ).then(coords=>{
        setRoutes(r=>({ ...r, [s.id]: coords }));
        setPositions(p=>({ ...p, [s.id]: 0 }));
      });
    });
  },[shipments]);

  // animate trucks
  useEffect(() => {
    const t = setInterval(()=>{
      setPositions(p => {
        const next = {...p};
        Object.entries(routes).forEach(([id,coords])=>{
          const i = p[id] || 0;
          if (i < coords.length - 1) next[id] = i + 1;
        });
        return next;
      });
    }, 1000);
    return ()=>clearInterval(t);
  }, [routes]);

  // apply filters
  const filtered = shipments
    .filter(s => companyFilter==='All' || s.company===companyFilter)
    .filter(s => statusFilter==='All' || s.status===statusFilter);

  return (
    <div className="min-h-screen flex relative">
      {/* Hamburger */}
      <button
        onClick={()=>setDrawerOpen(!drawerOpen)}
        className="absolute top-4 left-4 z-50 bg-white p-2 rounded shadow-lg"
      >
        <FaBars className="text-2xl" />
      </button>

      {/* Drawer */}
      <aside
  className={`bg-gray-100 p-4 space-y-4 overflow-y-auto w-20 transition-all duration-300 ${
    drawerOpen ? 'w-96' : 'w-0 overflow-hidden'
  }`}
  style={{ height: '100vh' }}
>

        {drawerOpen && (
          <>
            <h1 className="text-2xl font-bold mb-4">ภาพรวมภูมิภาค</h1>
            {(['north','northeast','central','south'] as RegionKey[]).map(key=>(
              <RegionCard
                key={key}
                regionName={{
                  north:'ภาคเหนือ',
                  northeast:'อีสาน',
                  central:'ภาคกลาง',
                  south:'ภาคใต้',
                }[key]}
                metrics={metrics}
                weeklySales={100}
                totalSales={25980}
                totalChange={15.6}
                onClick={()=>{}}
              />
            ))}
          </>
        )}
      </aside>

      {/* Map & Filters */}
      <div className="flex-1">
        {/* Company filter */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[999] flex space-x-2">
          {['All','TBL','SERMSUK','HAVI'].map(c=>(
            <button
              key={c}
              onClick={() => { setCompanyFilter(c as any); setStatusFilter('All'); }}
              className={`px-2 py-1 rounded ${
                companyFilter===c
                  ? 'bg-gradient-to-r from-[#004E92] via-[#0066CC] to-[#0099FF] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {c==='All' ? 'One Logistic' : c}
            </button>
          ))}
        </div>

        {/* Status filter (only when company != All) */}
        {companyFilter!=='All' && (
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-2 z-[999] flex space-x-2">
            {(['All','in_transit','broken','available'] as const).map(s=>(
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 rounded font-medium ${
                  statusFilter===s
                    ? s==='available'
                      ? 'bg-green-500 text-white'
                      : s==='broken'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {s==='All' ? 'All Status'
                 : s==='in_transit' ? 'กำลังวิ่ง'
                 : s==='broken'     ? 'ขัดข้อง'
                 : 'ว่าง'}
              </button>
            ))}
          </div>
        )}

        <MapContainer
          center={[13.7367,100.5232]}
          zoom={7}
          style={{ height:'100vh', width:'100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Polylines */}
          {filtered.map(s=>(
            routes[s.id] && (
              <Polyline
                key={s.id}
                positions={routes[s.id]!}
                pathOptions={{ color:'#0040ff', weight: 6, opacity:0.6 }}
              />
            )
          ))}

          {/* Truck markers */}
          {filtered.map(s=>{
            const coords = routes[s.id];
            const idx    = positions[s.id]||0;
            const pos: [number,number] = coords ? coords[idx] : [s.origin.latitude,s.origin.longitude];
            return (
              <Marker
                key={s.id}
                position={pos}
                icon={truckIcon(s.status)}
              >
                <Popup>
                  <strong>{s.id}</strong><br/>
                  Company: {s.company}<br/>
                  Status: {s.status}<br/>
                  Progress: {s.progress}%<br/>
                  Orders:
                  <ul className="list-disc ml-4">
                    {s.orders.map(o=>(
                      <li key={o.orderId}>{o.orderId}: {o.item} ×{o.quantity}</li>
                    ))}
                  </ul>
                </Popup>
              </Marker>
            );
          })}

          {/* Origin & Destination */}
          {filtered.map(s=>(
            <Marker
              key={s.id+'-o'}
              position={[s.origin.latitude,s.origin.longitude]}
              icon={originIcon}
            >
              <Popup>
                <strong>{s.origin.name}</strong><br/>
                Departure: {new Date(s.departure_time).toLocaleString()}
              </Popup>
            </Marker>
          ))}
          {filtered.map(s=>(
            <Marker
              key={s.id+'-d'}
              position={[s.destination.latitude,s.destination.longitude]}
              icon={destIcon}
            >
              <Popup>
                <strong>{s.destination.name}</strong><br/>
                ETA: {new Date(s.estimated_arrival_time).toLocaleString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
