
"use client";

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import shipmentsData from '../data/shipments.json'; // 1. นำเข้าข้อมูล

ChartJS.register(ArcElement, Tooltip, Legend);

interface Shipment {
  id: string;
  company: string;
  status: string; // เราจะใช้ field นี้
  // ... (fields อื่นๆ ที่มีใน JSON)
}

interface VehicleStatusCardProps {
  title: string;
  value: number;
  maxValue: number;
  color: string;
}

const VehicleStatusCard = ({ title, value, maxValue, color }: VehicleStatusCardProps) => {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0; // ป้องกันการหารด้วยศูนย์

  const chartData = {
    labels: ['', ''], // Label ไม่จำเป็นต้องแสดง
    datasets: [
      {
        data: [value, maxValue > 0 ? maxValue - value : 1], // ถ้า maxValue เป็น 0 ให้มีส่วนที่เหลือเป็น 1
        backgroundColor: [color, '#e5e7eb'], // สีเทาสำหรับส่วนที่เหลือ
        borderWidth: 0,
        cutout: '75%', // ขนาดของรูตรงกลาง
        circumference: 360,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // ทำให้ aspect ratio คงที่
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    // 1. ปรับขนาด Container ให้เล็กลง โดยเปลี่ยน class w-24 h-24 md:w-28 md:h-28
    <div className="relative w-20 h-20 md:w-24 md:h-24 "> {/* Adjusted size */}
      <Doughnut data={chartData} options={options} />
      {/* ส่วนของข้อความยังคงเดิม ไม่มีพื้นหลังเบลอ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[999]" >
        <span className="text-lg font-bold">{percentage}%</span>
        <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{title}</span> {/* ป้องกันการตัดคำ */}
        <span className="text-xs text-gray-500">{value}/{maxValue}</span>
      </div>
    </div>
  );
};

interface CalculatedStatus {
  title: string;
  value: number;
  maxValue: number;
  color: string;
}

export default function VehicleOverview() {
  const [calculatedStatuses, setCalculatedStatuses] = useState<CalculatedStatus[]>([]);

  useEffect(() => {
    // 2. คำนวณสถานะรถจาก shipmentsData
    const shipments: Shipment[] = shipmentsData.shipments;
    const totalVehicles = shipments.length;

    let inTransitCount = 0;
    let brokenCount = 0;
    let availableCount = 0;

    shipments.forEach(shipment => {
      if (shipment.status === "in_transit") {
        inTransitCount++;
      } else if (shipment.status === "broken") {
        brokenCount++;
      } else if (shipment.status === "available") {
        availableCount++;
      }
      // สามารถเพิ่มเงื่อนไขสำหรับ status อื่นๆ ได้ถ้ามี
    });

    const newStatuses: CalculatedStatus[] = [
      {
        title: "รถกำลังใช้งาน",
        value: inTransitCount,
        maxValue: totalVehicles,
        color: "#f44242", // สีแดง (เดิม)
      },
      {
        title: "รถซ่อมบำรุง",
        value: brokenCount,
        maxValue: totalVehicles,
        color: "#FFCB00", // สีเหลือง (เดิม)
      },
      {
        title: "รถพร้อมใช้งาน",
        value: availableCount,
        maxValue: totalVehicles,
        color: "#5ef916", // สีเขียว (เดิม)
      }
    ];
    // 3. อัปเดต State
    setCalculatedStatuses(newStatuses);
  }, []); // dependency array ว่างเพื่อให้ useEffect ทำงานครั้งเดียวหลัง component mount

  if (calculatedStatuses.length === 0) {
    return <div className="text-center p-4">กำลังโหลดข้อมูลภาพรวมรถ...</div>; // แสดงสถานะกำลังโหลด
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">ภาพรวมสถานะรถ</h2>
      {/* Top row with 3 circles */}
      <div className="flex justify-center md:justify-around gap-2"> {/* ปรับ layout ให้ responsive */}
        {calculatedStatuses.map((status, index) => (
          <VehicleStatusCard
            key={index}
            title={status.title}
            value={status.value}
            maxValue={status.maxValue}
            color={status.color}
          />
        ))}
      </div>
    </div>
  );
}