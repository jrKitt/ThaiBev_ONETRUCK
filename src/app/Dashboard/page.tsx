'use client';
import { useState } from 'react';
import { FaTruck, FaExclamationTriangle, FaMapMarkedAlt, FaClock } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import VehicleTable from '../components/Vehicles';

export default function Dashboard() {
  const [vehicleStats] = useState({
    onRoute: 42,
    errors: 8,
    deviated: 27,
    late: 13,
  });

  const [overviewData] = useState([
    { label: 'กำลังเดินทาง', percent: 39.7, time: '2 ชั่วโมง 10 นาที' },
    { label: 'กำลังขนถ่าย', percent: 28.3, time: '3 ชั่วโมง 15 นาที' },
    { label: 'กำลังบรรทุก', percent: 17.4, time: '1 ชั่วโมง 24 นาที' },
    { label: 'กำลังรอ', percent: 14.6, time: '5 ชั่วโมง 19 นาที' },
  ]);

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />

      <main className="flex-1 bg-blue-50 p-6 text-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          BEVONE – ระบบติดตาม GPS
        </h1>

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

        {/* ภาพรวมยานพาหนะ */}
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            ภาพรวมยานพาหนะ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {overviewData.map((item) => (
              <div
                key={item.label}
                className="p-4 bg-blue-100 rounded-lg shadow-sm"
              >
                <p className="text-sm font-medium text-gray-600">
                  {item.label}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {item.percent}%
                </p>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ตารางเส้นทางการขนส่ง */}
        <VehicleTable />
      </main>
    </div>
  );
}

// Component สรุปสถิติ
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
    teal: 'from-teal-200 to-teal-400',
    amber: 'from-amber-200 to-amber-400',
    pink: 'from-pink-200 to-pink-400',
    blue: 'from-blue-200 to-blue-400',
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
