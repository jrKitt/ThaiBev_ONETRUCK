"use client";

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface VehicleStatusCardProps {
  title: string;
  value: number;
  maxValue: number;
  color: string;
}

const VehicleStatusCard = ({ title, value, maxValue, color }: VehicleStatusCardProps) => {
  const percentage = Math.round((value / maxValue) * 100);
  
  const chartData = {
    labels: ['', ''],
    datasets: [
      {
        data: [value, maxValue - value],
        backgroundColor: [color, '#e5e7eb'],
        borderWidth: 0,
        cutout: '75%',
        circumference: 360,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
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
    <div className="relative w-32 h-32">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{percentage}%</span>
        <span className="text-xs font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-500">{value}/{maxValue}</span>
      </div>
    </div>
  );
};

export default function VehicleOverview() {
  // Vehicle status data
  const vehicleStatuses = [
    {
      title: "รถกำลังใช้งาน",
      value: 12,
      maxValue: 20,
      color: "#fd2020", 
    },
    {
      title: "รถซ่อมบำรุง",
      value: 5,
      maxValue: 20,
      color: "rgba(249, 115, 22, 1)", 
    },
    {
      title: "รถพร้อมใช้งาน",
      value: 3,
      maxValue: 20,
      color: "#5ef916", 
    }
  ];

  return (
    <div className="w-full">
      {/* Top row with 2 circles */}
      <div className="flex justify-center gap-6 mb-4">
        <VehicleStatusCard
          title={vehicleStatuses[0].title}
          value={vehicleStatuses[0].value}
          maxValue={vehicleStatuses[0].maxValue}
          color={vehicleStatuses[0].color}
        />
        <VehicleStatusCard
          title={vehicleStatuses[1].title}
          value={vehicleStatuses[1].value}
          maxValue={vehicleStatuses[1].maxValue}
          color={vehicleStatuses[1].color}
        />
      </div>
      
      {/* Bottom row with 1 circle in center */}
      <div className="flex justify-center">
        <VehicleStatusCard
          title={vehicleStatuses[2].title}
          value={vehicleStatuses[2].value}
          maxValue={vehicleStatuses[2].maxValue}
          color={vehicleStatuses[2].color}
        />
      </div>
    </div>
  );
}