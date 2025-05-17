'use client';
// components/VehicleTable.tsx
import { FaCar, FaEllipsisV } from 'react-icons/fa';

const vehicles = [
  {
    id: 'TRK-001',
    from: 'คลังสินค้า ชลบุรี',
    to: 'ตัวแทนจำหน่าย ระยอง',
    warning: 'ไม่พบปัญหา',
    warningColor: 'bg-green-100 text-green-700',
    progress: 80,
  },
  {
    id: 'TRK-002',
    from: 'ศูนย์กระจายสินค้า กรุงเทพ',
    to: 'ตัวแทน ลพบุรี',
    warning: 'เครื่องยนต์ไม่ตอบสนอง',
    warningColor: 'bg-red-100 text-red-700',
    progress: 20,
  },
  {
    id: 'TRK-003',
    from: 'คลังสินค้า สระบุรี',
    to: 'ร้านค้า ขอนแก่น',
    warning: 'ระบบเบรกมีปัญหา',
    warningColor: 'bg-blue-100 text-blue-700',
    progress: 10,
  },
  {
    id: 'TRK-004',
    from: 'RDC สมุทรปราการ',
    to: 'จุดกระจายของ เชียงใหม่',
    warning: 'ไม่พบปัญหา',
    warningColor: 'bg-green-100 text-green-700',
    progress: 92,
  },
  {
    id: 'TRK-005',
    from: 'DC ปทุมธานี',
    to: 'เอเย่นต์ นครราชสีมา',
    warning: 'ไม่พบปัญหา',
    warningColor: 'bg-green-100 text-green-700',
    progress: 65,
  },
];


export default function VehicleTable() {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">เส้นทางการขนส่ง(รถบรรทุก)</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <FaEllipsisV />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              <th className="px-4 py-2">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-2">ตำแหน่งปัจจุบัน</th>
              <th className="px-4 py-2">จุดเริ่มต้นเส้นทาง</th>
              <th className="px-4 py-2">จุดสิ้นสุดเส้นทาง</th>
              <th className="px-4 py-2">ความเสี่ยง</th>
              <th className="px-4 py-2">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="text-xl text-gray-500 bg-gray-100 rounded-full p-2">
                      <FaCar />
                    </div>
                    <a href="/FLEET" className="text-gray-800 hover:text-[#00783F] font-semibold">
                      {v.id}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-2 text-gray-700">{v.from}</td>
                <td className="px-4 py-2 text-gray-700">{v.to}</td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${v.warningColor}`}>
                    {v.warning}
                  </span>
                </td>
                <td className="px-4 py-2 w-40">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-purple-100 rounded h-2">
                      <div
                        className="bg-purple-600 h-2 rounded"
                        style={{ width: `${v.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">{v.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
