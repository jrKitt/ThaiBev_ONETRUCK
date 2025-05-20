'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/app/components/Sidebar';

import shipmentsData from '../data/shipments.json';

interface Truck {
  licensePlate: string;
  driverName: string;
  driverPhone: string | null;
  truckClass: string;
  region: number;
  depot: string;
}

const regions = [
  { id: 1, name: 'ภาคกลางและกรุงเทพฯ' },
  { id: 2, name: 'ภาคตะวันออก' },
  { id: 3, name: 'ภาคอีสานตอนล่าง' },
  { id: 4, name: 'ภาคอีสานตอนบน' },
  { id: 5, name: 'ภาคเหนือ' },
  { id: 6, name: 'ภาคเหนือ 2' },
  { id: 7, name: 'ภาคตะวันตก' },
  { id: 8, name: 'ภาคใต้' },
];

const ITEMS_PER_PAGE = 5;

// แผนที่ประเภทรถ ไปยัง URL รูปไอคอน
const truckIcons: Record<string, string> = {
  '4WB': '/truck-icons.png',
  '6WB': '/truck-icons.png',
  '8WB': '/truck-icons.png',
  '10WB': '/truck-icons.png',
  default: '/truck-icons.png',
};

export default function TrucksByRegion() {
  const [selectedRegion, setSelectedRegion] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<'licensePlate' | 'driverName' | 'depot'>('licensePlate');
  const [page, setPage] = useState(1);

  // ดึงรถทั้งหมดจาก JSON
  const allTrucks: Truck[] = useMemo(() => {
    return shipmentsData.shipments
      .map(s => s.truck)
      .filter(t => t != null);
  }, []);

  // กรองรถตามภูมิภาค และ search
  const filteredTrucks = useMemo(() => {
    return allTrucks.filter(truck =>
      truck.region === selectedRegion &&
      (
        truck.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.driverName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [allTrucks, selectedRegion, searchTerm]);

  // เรียงข้อมูลตาม sortKey
  const sortedTrucks = useMemo(() => {
    return filteredTrucks.slice().sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });
  }, [filteredTrucks, sortKey]);

  // Pagination
  const totalPages = Math.ceil(sortedTrucks.length / ITEMS_PER_PAGE);
  const pagedTrucks = sortedTrucks.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortKey(e.target.value as any);
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="min-h-screen flex bg-white text-gray-800">
      <Sidebar />

      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">ข้อมูลรถบรรทุกตามภูมิภาค</h1>

        {/* ปุ่มเลือกภูมิภาค */}
        <div className="mb-6 flex flex-wrap gap-2">
          {regions.map(region => (
            <button
              key={region.id}
              className={`px-4 py-2 rounded font-semibold ${
                region.id === selectedRegion
                  ? 'bg-gray-200 shadow-inner'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedRegion(region.id);
                setPage(1);
                setSearchTerm('');
              }}
            >
              {region.name}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 w-full max-w-xs">
            <input
              type="text"
              placeholder="ค้นหา (ทะเบียนหรือชื่อคนขับ)"
              className="w-full outline-none"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div>
            <label className="mr-2 font-semibold">เรียงตาม</label>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={sortKey}
              onChange={handleSortChange}
            >
              <option value="licensePlate">ทะเบียนรถ</option>
              <option value="driverName">ชื่อคนขับ</option>
              <option value="depot">คลังสินค้า</option>
            </select>
          </div>
        </div>

        <p className="mb-2 text-sm text-gray-600">
          {sortedTrucks.length} รายการรถบรรทุกในภูมิภาคนี้
        </p>

        {/* ตารางแสดงข้อมูล */}
        <div className="overflow-x-auto border rounded-lg border-gray-300">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Truck Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depot
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedTrucks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-600">
                    ไม่พบข้อมูลรถบรรทุก
                  </td>
                </tr>
              ) : (
                pagedTrucks.map((truck, idx) => {
                  const iconUrl = truckIcons[truck.truckClass] || truckIcons.default;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <img
                          src={iconUrl}
                          alt={truck.truckClass}
                          className="w-10 h-10 object-contain"
                        />
                        <span>{truck.licensePlate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{truck.driverName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">0{truck.driverPhone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{truck.truckClass}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{truck.depot}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-gray-500 hover:text-gray-700">•••</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              ก่อนหน้า
            </button>
            <span className="select-none">
              หน้า {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              ถัดไป
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
