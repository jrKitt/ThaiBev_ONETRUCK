'use client';

import { useState } from 'react';
import { FaCar } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from '../components/Sidebar';


const vehicles = [
  {
    id: 'VOL-342808',
    location: 'Chelsea, Bangkok, TH',
    status: 'กำลังออกจากคลังสินค้า',
    logs: [
      { status: 'สร้างหมายเลขติดตามแล้ว', by: 'Kittipong N.', date: 'May 17', time: '07:53 AM' },
      { status: 'กำลังออกจากคลังสินค้า', by: 'Kittipong N.', date: 'May 17', time: '08:02 AM' },
      { status: 'ถึงจุดหมาย', by: 'Thanawat C.', date: 'May 17', time: '08:40 AM' },
    ],
    progress: 88,
    position: [13.7465, 100.5328], // mock LatLng
  },
  {
    id: 'VOL-954784',
    location: 'Lak Si, Bangkok, TH',
    position: [13.8807, 100.5684],
  },
  {
    id: 'VOL-343908',
    location: 'Samut Prakan, TH',
    position: [13.5991, 100.5967],
  },
];

const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854929.png',
  iconSize: [32, 32],
});

export default function FleetPage() {
  const [selected, setSelected] = useState(vehicles[0]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-black">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">GPS TRACKING SYSTEM</h2>
        <div className="space-y-6">
          <div>
            <p className="font-semibold">{selected.id}</p>
            <p className="text-sm text-gray-600">{selected.location}</p>

            <div className="mt-4">
              <p className="text-sm mb-1">การดำเนินการขนส่ง</p>
              <div className="w-full h-2 bg-purple-100 rounded">
                <div
                  className="bg-[#02AD99] h-2 rounded"
                  style={{ width: `${selected.progress}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-gray-600 mt-1">{selected.progress}%</p>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              {selected.logs?.map((log, i) => (
                <div key={i}>
                  <p
                    className={`font-medium ${
                      log.status === 'ถึงที่หมายแล้ว' ? 'text-[#02AD99]' : log.status.includes('OUT') ? 'text-green-600' : 'text-gray-800'
                    }`}
                  >
                    {log.status}
                  </p>
                  <p className="text-gray-600">
                    {log.by} — {log.date}, {log.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  selected.id === v.id ? 'bg-gray-100 font-semibold' : ''
                }`}
                onClick={() => setSelected(v)}
              >
                <div className="text-gray-500 bg-gray-100 p-2 rounded-full">
                  <FaCar />
                </div>
                <div>
                  <p>{v.id}</p>
                  <p className="text-xs text-gray-500">{v.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[13.7367, 100.5232]} zoom={11} style={{ height: '100vh' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {vehicles.map((v) => (
            <Marker key={v.id} position={v.position as [number, number]} icon={carIcon} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}