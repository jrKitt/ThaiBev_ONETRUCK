'use client';
// pages/index.tsx
import { useState } from 'react';
import { FaTruck, FaExclamationTriangle, FaMapMarkedAlt, FaClock } from 'react-icons/fa';
import VehicleTable from './components/Vehicles';
import Sidebar from './components/Sidebar';

export default function Home() {
  const [vehicleStats] = useState({
    onRoute: 42,
    errors: 8,
    deviated: 27,
    late: 13,
  });

  const [overview] = useState({
    onTheWay: { percent: 39.7, time: '2 ชั่วโมง 10 นาที' },
    unloading: { percent: 28.3, time: '3 ชั่วโมง 15 นาที' },
    loading: { percent: 17.4, time: '1 ชั่วโมง 24 นาที' },
    waiting: { percent: 14.6, time: '5 ชั่วโมง 19 นาที' },
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-6 text-gray-800">
        <h1 className="text-2xl font-bold mb-6">BEVONE - GPS Tracking System</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FaTruck />} title="รถที่อยู่ระหว่างทาง" value={vehicleStats.onRoute} change="+18.2%" color="purple" />
          <StatCard icon={<FaExclamationTriangle />} title="รถที่มีข้อผิดพลาด" value={vehicleStats.errors} change="-8.7%" color="yellow" />
          <StatCard icon={<FaMapMarkedAlt />} title="ออกนอกเส้นทาง" value={vehicleStats.deviated} change="+4.3%" color="pink" />
          <StatCard icon={<FaClock />} title="รถล่าช้า" value={vehicleStats.late} change="+2.5%" color="blue" />
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ภาพรวมยานพาหนะ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(overview).map(([key, data]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-lg font-bold">{data.percent}%</p>
                <p className="text-sm text-gray-400">{data.time}</p>
              </div>
            ))}
          </div>
        </div>

        <VehicleTable />
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, change, color }: { icon: any; title: string; value: number; change: string; color: string }) {
  const colorMap: Record<string, string> = {
    purple: 'from-purple-400 to-purple-600',
    yellow: 'from-yellow-400 to-yellow-600',
    pink: 'from-pink-400 to-pink-600',
    blue: 'from-blue-400 to-blue-600',
  };

  return (
    <div className={`p-4 rounded-xl text-white bg-gradient-to-r ${colorMap[color]} shadow-lg`}>
      <div className="flex items-center space-x-3">
        <div className="text-xl">{icon}</div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-white/80">{change} จากสัปดาห์ที่แล้ว</p>
        </div>
      </div>
    </div>
  );
}