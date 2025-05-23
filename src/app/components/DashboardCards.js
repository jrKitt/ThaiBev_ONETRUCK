import React, { useEffect, useState } from 'react';
import shipmentsData from '../data/shipments.json';
import { FaChevronDown, FaTruck, FaWrench, FaCircle } from 'react-icons/fa';

const DashboardCards = () => {
  const [vehicleStatuses, setVehicleStatuses] = useState({
    total: 0,
    inTransit: 0,
    available: 0,
    broken: 0,
    companies: {}
  });

  useEffect(() => {
    const shipments = shipmentsData.shipments;
    const totalVehicles = shipments.length;
    const inTransit = shipments.filter(s => s.status === "in_transit").length;
    const available = shipments.filter(s => s.status === "available").length;
    const broken = shipments.filter(s => s.status === "broken").length;

    // กลุ่มข้อมูลตาม company
    const companies = {};
    shipments.forEach(shipment => {
      const company = shipment.company || 'Unknown';
      
      if (!companies[company]) {
        companies[company] = {
          total: 0,
          inTransit: 0,
          available: 0,
          broken: 0
        };
      }
      
      companies[company].total++;
      
      if (shipment.status === "in_transit") {
        companies[company].inTransit++;
      } else if (shipment.status === "available") {
        companies[company].available++;
      } else if (shipment.status === "broken") {
        companies[company].broken++;
      }
    });

    setVehicleStatuses({
      total: totalVehicles,
      inTransit,
      available,
      broken,
      companies
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4">
      {/* หัวข้อหลัก */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-gray-600">จำนวนรถทั้งหมด</div>
            <div className="text-4xl font-bold">{vehicleStatuses.total} คัน</div>

          </div>
          <span className="bg-amber-50 text-amber-600 rounded-lg px-4 py-1 font-semibold">
            ภาพรวม
          </span>
        </div>

      </div>

      {/* สรุปสถิติ */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex justify-between">
            <div className="text-red-500 font-bold text-xl">
              {Math.round((vehicleStatuses.inTransit / vehicleStatuses.total) * 100) || 0}%
            </div>
            <FaTruck className="text-2xl text-red-500" />
          </div>
          <div className="font-semibold text-gray-800 mt-2">
            กำลังใช้งาน: {vehicleStatuses.inTransit}
          </div>
          <div className="text-gray-600 text-sm">
            จำนวน: {vehicleStatuses.inTransit}
          </div>
          <div className="h-1 bg-gray-100 rounded-full mt-2">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((vehicleStatuses.inTransit / vehicleStatuses.total) * 100) || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex justify-between">
            <div className="text-green-500 font-bold text-xl">
              {Math.round((vehicleStatuses.available / vehicleStatuses.total) * 100) || 0}%
            </div>
            <FaCircle className="text-2xl text-green-500" />
          </div>
          <div className="font-semibold text-gray-800 mt-2">
            ว่าง: {vehicleStatuses.available}
          </div>
          <div className="text-gray-600 text-sm">
            จำนวน: {vehicleStatuses.available}
          </div>
          <div className="h-1 bg-gray-100 rounded-full mt-2">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((vehicleStatuses.available / vehicleStatuses.total) * 100) || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex justify-between">
            <div className="text-amber-500 font-bold text-xl">
              {Math.round((vehicleStatuses.broken / vehicleStatuses.total) * 100) || 0}%
            </div>
            <FaWrench className="text-2xl text-amber-500" />
          </div>
          <div className="font-semibold text-gray-800 mt-2">
            ซ่อมบำรุง: {vehicleStatuses.broken}
          </div>
          <div className="text-gray-600 text-sm">
            จำนวน: {vehicleStatuses.broken}
          </div>
          <div className="h-1 bg-gray-100 rounded-full mt-2">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((vehicleStatuses.broken / vehicleStatuses.total) * 100) || 0}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* ส่วน Accordion ข้อมูลแต่ละบริษัท */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">ข้อมูลตามบริษัท</h2>
        
        <div className="space-y-3">
          {Object.entries(vehicleStatuses.companies).map(([company, stats]) => (
            <div key={company} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                  <div className="flex items-center">
                    <div className="font-semibold text-blue-800">{company}</div>
                    <div className="text-sm text-gray-500 ml-3">{stats.total} คัน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 text-sm">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 my-auto"></span>
                      <span className="font-medium">{stats.inTransit}</span>
                    </div>
                    <div className="flex gap-1 text-sm">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 my-auto"></span>
                      <span className="font-medium">{stats.available}</span>
                    </div>
                    <div className="flex gap-1 text-sm">
                      <span className="inline-block w-3 h-3 rounded-full bg-amber-500 my-auto"></span>
                      <span className="font-medium">{stats.broken}</span>
                    </div>
                    <FaChevronDown className="transform group-open:rotate-180 transition-transform duration-200" />
                  </div>
                </summary>
                
                <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                  <div className="flex justify-between mb-3">
                    <div className="text-red-600 flex flex-col items-center">
                      <span className="font-medium text-lg">{stats.inTransit}</span>
                      <span className="text-xs">กำลังใช้งาน</span>
                    </div>
                    <div className="text-green-600 flex flex-col items-center">
                      <span className="font-medium text-lg">{stats.available}</span>
                      <span className="text-xs">ว่าง</span>
                    </div>
                    <div className="text-amber-600 flex flex-col items-center">
                      <span className="font-medium text-lg">{stats.broken}</span>
                      <span className="text-xs">ซ่อมบำรุง</span>
                    </div>
                  </div>
                  
                  {/* ข้อมูลเพิ่มเติม */}
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <h4 className="font-medium mb-2 text-gray-700">สัดส่วนสถานะรถ</h4>
                    
                    <div className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span>กำลังใช้งาน</span>
                        <span>{Math.round((stats.inTransit / stats.total) * 100) || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${Math.round((stats.inTransit / stats.total) * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span>ว่าง</span>
                        <span>{Math.round((stats.available / stats.total) * 100) || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${Math.round((stats.available / stats.total) * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>ซ่อมบำรุง</span>
                        <span>{Math.round((stats.broken / stats.total) * 100) || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${Math.round((stats.broken / stats.total) * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;