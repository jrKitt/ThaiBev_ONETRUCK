import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import shipmentsData from '../data/shipments.json';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OverviewProps {
  title: string;
  values: { value: number; color: string }[];
  maxValue: number;
}

const Overview = ({ title, values, maxValue }: OverviewProps) => {
  const totalValue = values.reduce((sum, { value }) => sum + value, 0);
  const percentage = Math.round((totalValue / maxValue) * 100);

  const chartData = {
    labels: ['', '', ''],
    datasets: values.map(({ value, color }, index) => ({
      data: [value, maxValue - totalValue],
      backgroundColor: [color, '#e5e7eb'],
      borderWidth: 0,
      cutout: '75%',
      circumference: 360,
      rotation: 270,
      offset: index * 5, 
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="relative w-64 h-64">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{percentage}%</span>
        <span className="text-xs font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-500">{totalValue}/{maxValue}</span>
      </div>
    </div>
  );
};

export default function VehicleOverview() {
  const [vehicleStatuses, setVehicleStatuses] = useState([
    { title: "รถกำลังใช้งาน", value: 0, maxValue: 0, color: "#2720fd" },
    { title: "รถว่าง", value: 0, maxValue: 0, color: "#10b981" },
    { title: "รถเสีย", value: 0, maxValue: 0, color: "#ef4444" },
  ]);

  useEffect(() => {
    const shipments = shipmentsData.shipments;
    const totalVehicles = shipments.length;
    const inTransit = shipments.filter(s => s.status === "in_transit").length;
    const available = shipments.filter(s => s.status === "available").length;
    const broken = shipments.filter(s => s.status === "broken").length;

    setVehicleStatuses([
      { title: "รถกำลังใช้งาน", value: inTransit, maxValue: totalVehicles, color: "#ef4444" },
      { title: "รถว่าง", value: available, maxValue: totalVehicles, color: "#10b981" },
      { title: "รถซ่อมบำรุง", value: broken, maxValue: totalVehicles, color: "#efd244" },
    ]);
  }, []);

  return (
    <div className="w-full">
      {/* Top row with 2 circles */}
      <div className="flex justify-center gap-6 mb-4">
        <Overview
          title="รถใช้งานได้ / กำลังใช้งาน"
          values={[
            { value: vehicleStatuses[0].value, color: vehicleStatuses[0].color },
            { value: vehicleStatuses[1].value, color: vehicleStatuses[1].color },
          ]}
          maxValue={vehicleStatuses[0].maxValue}
        />
      </div>
    </div>
  );
}