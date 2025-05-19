'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from '@/app/components/Sidebar';
import VehicleTable from '@/app/components/Vehicles';

// ─── Import your JSON (TopoJSON or GeoJSON) ───────────────────────────────
import provincesTopo from '../../../data/thailand_provinces.json';
import { feature } from 'topojson-client';

// ───────── ICON ─────────────────────────────────────────────────────────────
const defaultIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ───────── STAT CARD ─────────────────────────────────────────────────────────
import { FaTruck, FaExclamationTriangle, FaMapMarkedAlt, FaClock } from 'react-icons/fa';
function StatCard({
  icon,
  title,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  change: string;
  color: 'teal' | 'amber' | 'pink' | 'blue';
}) {
  const colorMap: Record<string, string> = {
    teal:  'from-teal-200 to-teal-400',
    amber: 'from-amber-200 to-amber-400',
    pink:  'from-pink-200 to-pink-400',
    blue:  'from-blue-200 to-blue-400',
  };
  return (
    <div
      className={`p-4 rounded-xl text-white bg-gradient-to-r ${colorMap[color]} shadow`}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl opacity-90">{icon}</div>
        <div>
          <p className="text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-white/90">{change} จากสัปดาห์ก่อน</p>
        </div>
      </div>
    </div>
  );
}

// ───────── MAIN PAGE ─────────────────────────────────────────────────────────
export default function RDCDashboardPage() {
  const { region, rdc } = useParams() as { region: string; rdc: string };

  // — Convert TopoJSON → GeoJSON or use GeoJSON directly:
  const provincesGeo = useMemo<GeoJSON.FeatureCollection>(() => {
    const topo: any = provincesTopo;
    // TopoJSON case:
    if (topo.objects && typeof topo.objects === 'object') {
      const key = Object.keys(topo.objects)[0];
      const geomCollection = topo.objects[key];
      return feature(topo, geomCollection) as GeoJSON.FeatureCollection;
    }
    // GeoJSON case:
    if (Array.isArray(topo.features)) {
      return topo as GeoJSON.FeatureCollection;
    }
    // fallback empty:
    console.warn('Invalid provinces JSON, rendering no features.');
    return { type: 'FeatureCollection', features: [] };
  }, []);

  // — Filter only “north” features:
  const northernProvinces =
    region === 'north'
      ? provincesGeo.features.filter(
          (f) => f.properties?.REGION === 'north'
        )
      : [];

  // region center lookup
  const regionCenters: Record<string, [number, number]> = {
    north:     [18.0,    99.0],
    northeast: [16.0,   104.0],
    central:   [14.0,   100.0],
    south:     [ 8.0,    99.0],
  };
  const center = regionCenters[region] || [13.7367, 100.5232];

  // Dummy stats (replace with real data fetch)
  const [vehicleStats] = useState({
    onRoute: 42,
    errors:   8,
    deviated:27,
    late:    13,
  });
  const [overviewData] = useState([
    { label: 'กำลังเดินทาง', percent: 39.7, time: '2 ชั่วโมง 10 นาที' },
    { label: 'กำลังขนถ่าย', percent: 28.3, time: '3 ชั่วโมง 15 นาที' },
    { label: 'กำลังบรรทุก', percent: 17.4, time: '1 ชั่วโมง 24 นาที' },
    { label: 'กำลังรอ',     percent: 14.6, time: '5 ชั่วโมง 19 นาที' },
  ]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 bg-blue-50 p-6 text-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {region.toUpperCase()} – {decodeURIComponent(rdc)} Dashboard
        </h1>

        {/* Map */}
        <div className="h-80 mb-6 rounded-lg overflow-hidden shadow-md">
          <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* single RDC marker */}
            <Marker position={center} icon={defaultIcon}>
              <Popup>{decodeURIComponent(rdc)}</Popup>
            </Marker>

            {/* ONLY in “north”: draw province boundaries */}
            {region === 'north' && (
              <GeoJSON
                data={{ type: 'FeatureCollection', features: northernProvinces }}
                style={() => ({ fill: false, weight: 1, color: '#444' })}
                onEachFeature={(feature, layer) => {
                  layer.bindTooltip(feature.properties.PROV_NAME, {
                    permanent: true,
                    direction: 'center',
                    className: 'font-bold text-sm text-gray-800',
                    offset: [0, 0],
                  });
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaTruck />}
            title="รถกำลังเดินทาง"
            value={vehicleStats.onRoute}
            change="+18.2%"
            color="teal"
          />
          <StatCard
            icon={<FaExclamationTriangle />}
            title="รถมีข้อผิดพลาด"
            value={vehicleStats.errors}
            change="-8.7%"
            color="amber"
          />
          <StatCard
            icon={<FaMapMarkedAlt />}
            title="รถออกนอกเส้นทาง"
            value={vehicleStats.deviated}
            change="+4.3%"
            color="pink"
          />
          <StatCard
            icon={<FaClock />}
            title="รถล่าช้า"
            value={vehicleStats.late}
            change="+2.5%"
            color="blue"
          />
        </div>

        {/* Overview */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            ภาพรวมยานพาหนะ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {overviewData.map((item) => (
              <div key={item.label} className="p-4 bg-blue-100 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-lg font-bold text-gray-800">{item.percent}%</p>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vehicle routes table */}
        <VehicleTable />
      </main>
    </div>
  );
}
