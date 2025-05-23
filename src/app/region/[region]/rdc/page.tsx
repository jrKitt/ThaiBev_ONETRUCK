'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import provincesTopo from '../../../data/thailand_provinces.json';
import { feature } from 'topojson-client';
import Papa from 'papaparse';
import { FaTruck, FaExclamationTriangle, FaMapMarkedAlt, FaClock, FaClipboardList, FaChevronDown, FaCalendarAlt, FaCar } from 'react-icons/fa';
import { DateRange, DayPicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, addDays } from 'date-fns';
import th from 'date-fns/locale/th';

// ICON
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// STAT CARD
function StatCard({
  icon,
  title,
  value,
  change,
  color,
}) {
  const colorMap = {
    teal: 'from-teal-200 to-teal-400',
    amber: 'from-amber-200 to-amber-400',
    pink: 'from-pink-200 to-pink-400',
    blue: 'from-blue-200 to-blue-400',
    green: 'from-green-200 to-green-400',
    red: 'from-red-200 to-red-400',
  };
  return (
    <div className={`p-4 rounded-xl text-white bg-gradient-to-r ${colorMap[color]} shadow-md transition-transform hover:scale-105`}>
      <div className="flex items-center space-x-3">
        <div className="text-2xl opacity-90">{icon}</div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-white/90">{change}</p>
        </div>
      </div>
    </div>
  );
}

export default function RDCDashboardPage() {
  const { region, rdc } = useParams() as { region: string; rdc: string };

  // Convert TopoJSON to GeoJSON
  const provincesGeo = useMemo(() => {
    const topo: any = provincesTopo;
    if (topo.objects && typeof topo.objects === 'object') {
      const key = Object.keys(topo.objects)[0];
      const geomCollection = topo.objects[key];
      return feature(topo, geomCollection) as GeoJSON.FeatureCollection;
    }
    if (Array.isArray(topo.features)) {
      return topo as GeoJSON.FeatureCollection;
    }
    console.warn('Invalid provinces JSON');
    return { type: 'FeatureCollection', features: [] };
  }, []);

  const northernProvinces = region === 'north' ? provincesGeo.features.filter(f => f.properties?.REGION === 'north') : [];

  const regionCenters = {
    north: [18.0, 99.0],
    northeast: [16.0, 104.0],
    central: [14.0, 100.0],
    south: [8.0, 99.0],
  };
  const center = regionCenters[region] || [13.7367, 100.5232];

  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    inProcess: 0,
    pending: 0,
  });

  const [vehicleStats, setVehicleStats] = useState({
    basedOnOrders: 0,
    available: 10,
    requiredCapacity: 80,
  });

  const [businessUnits, setBusinessUnits] = useState([
    {
      name: 'TBL',
      total: 100,
      completed: 50,
      inProcess: 25,
      pending: 25,
      details: [
        { product: 'Beer', quantity: 120, unit: 'ลัง', channel: 'TT' },
        { product: 'Beer', quantity: 80, unit: 'ลัง', channel: 'OMT' },
        { product: 'Spirit', quantity: 60, unit: 'ลัง', channel: 'CVM' },
        { product: 'Non-Al', quantity: 40, unit: 'ลัง', channel: 'TD' },
      ],
    },
    {
      name: 'SERMSUK',
      total: 70,
      completed: 40,
      inProcess: 10,
      pending: 20,
      details: [
        { product: 'Non-Al', quantity: 40, unit: 'ลัง', channel: 'MT' },
        { product: 'Non-Al', quantity: 40, unit: 'ลัง', channel: 'OMT' },
      ],
    },
    {
      name: 'HAVI',
      total: 30,
      completed: 10,
      inProcess: 10,
      pending: 10,
      details: [
        { product: 'สินค้าแช่แข็ง', quantity: 50, unit: 'กล่อง', channel: 'FOOD' },
      ],
    },
  ]);

  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: addDays(new Date(), 7), key: 'selection' },
  ]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([new Date()]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'range' | 'multiple'>('range');

  useEffect(() => {
    Papa.parse("/data/TO.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const rawData = result.data as any[];
        const filteredData = rawData.filter(row => row && Object.keys(row).length > 0 && row["สถานะ"]);
        
        const total = filteredData.length;
        const completed = filteredData.filter(item => item["สถานะ"] === "DELIVERY_COMPLETED").length;
        const inProcess = filteredData.filter(item => item["สถานะ"] === "IN_PROCESS").length;
        const pending = filteredData.filter(item => item["สถานะ"] === "OPEN").length;
        
        setOrderStats({ total, completed, inProcess, pending });
        
        const basedOnOrders = Math.ceil(total / 10);
        const requiredCapacityNet = vehicleStats.requiredCapacity - total;
        setVehicleStats(prev => ({ ...prev, basedOnOrders, requiredCapacity: requiredCapacityNet }));
      },
      error: (err) => console.error("Error:", err),
    });
  }, []);

  const handleDateChange = (item) => setDateRange([item.selection]);
  const handleMultipleDateChange = (date) => {
    setSelectedDates(prev => 
      prev.some(d => d.getTime() === date.getTime()) 
        ? prev.filter(d => d.getTime() !== date.getTime()) 
        : [...prev, date]
    );
  };
  const formatDateDisplay = () => {
    if (datePickerType === 'range') {
      return `${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}`;
    }
    return selectedDates.length > 0 ? `${selectedDates.length} วันที่เลือก` : 'เลือกวันที่';
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">WareHouse - Surathani</h1>

        <div className="h-80 rounded-lg overflow-hidden shadow-md">
          <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={center} icon={defaultIcon}><Popup>{rdc}</Popup></Marker>
            {region === 'north' && <GeoJSON data={{ type: 'FeatureCollection', features: northernProvinces }} style={{ color: '#444' }} />}
          </MapContainer>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-600">วันที่</label>
            <div className="relative">
              <div onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} className="w-full p-2 border border-white rounded-md bg-white shadow-sm flex justify-between items-center cursor-pointer">
                <span>{formatDateDisplay()}</span>
                <FaCalendarAlt className="text-gray-400" />
              </div>
              {isDatePickerOpen && (
                <div className="absolute z-10 mt-1 bg-white border-white rounded-md shadow-lg p-2 border w-64">
                  {datePickerType === 'range' ? (
                    <DateRange onChange={handleDateChange} ranges={dateRange} locale={th} />
                  ) : (
                    <DayPicker onDayClick={handleMultipleDateChange} selectedDays={selectedDates} locale={th} />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-600">Business Unit</label>
            <select className="w-full p-2 border rounded-md border-white bg-white shadow-sm">
              <option>ทั้งหมด</option>
              <option>TBL</option>
              <option>SERMSUK</option>
              <option>HAVI</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
          <StatCard icon={<FaClipboardList />} title="Total Order " value="200" change="+5%" color="teal" />
          <StatCard icon={<FaTruck />} title="Completed" value="100" change="+3%" color="blue" />
          <StatCard icon={<FaClock />} title="In Process" value="75"change="-2%" color="amber" />
          <StatCard icon={<FaClock />} title="Pending" value="25" change="-2%" color="red" />

        </div>
 <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-600">วันที่</label>
            <div className="relative">
              <div onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} className="w-75 p-2 border border-white rounded-md bg-white shadow-sm flex justify-between items-center cursor-pointer">
                <span>{formatDateDisplay()}</span>
                <FaCalendarAlt className="text-gray-400" />
              </div>
              {isDatePickerOpen && (
                <div className="absolute z-10 mt-1 bg-white border-white rounded-md shadow-lg p-2 border w-64">
                  {datePickerType === 'range' ? (
                    <DateRange onChange={handleDateChange} ranges={dateRange} locale={th} />
                  ) : (
                    <DayPicker onDayClick={handleMultipleDateChange} selectedDays={selectedDates} locale={th} />
                  )}
                </div>
              )}
            </div>
          </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
                   
              <StatCard icon={<FaCar />} title="รถตาม Order" value="50" change="+2%" color="green" />
          <StatCard icon={<FaCar />} title="รถพร้อมใช้" value="30" change="0%" color="pink" />
          <StatCard icon={<FaExclamationTriangle />} title="จัดหารถ" value="20" change="-1%" color="teal" />
        </div>


        <VehicleTable />
        <section className="bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">ข้อมูลตาม Business Unit</h2>
          {businessUnits.map(bu => (
            <div key={bu.name} className="bg-white rounded-lg  shadow-sm">
              <details>
                <summary className="flex justify-between p-4 cursor-pointer font-medium text-gray-700">
                  <span>{bu.name} - {bu.total} Pallet</span>
                  <FaChevronDown className="text-gray-500" />
                </summary>
                <div className="p-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completed: {bu.completed}</span>
                    <span>In Process: {bu.inProcess}</span>
                    <span>Pending: {bu.pending}</span>
                  </div>
                  <table className="w-full mt-2">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left">สินค้า</th>
                        <th className="px-3 py-2 text-center">จำนวน</th>
                        <th className="px-3 py-2 text-center">หน่วย</th>
                        <th className="px-3 py-2 text-center">Channel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bu.details.map(d => (
                        <tr key={d.product}>
                          <td className="px-3 py-2">{d.product}</td>
                          <td className="px-3 py-2 text-center">{d.quantity}</td>
                          <td className="px-3 py-2 text-center">{d.unit}</td>
                          <td className="px-3 py-2 text-center">{d.channel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}