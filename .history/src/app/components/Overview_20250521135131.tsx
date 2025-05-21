"use client";

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OverviewProps {
  title: string;
  value: number;
  maxValue: number;
  color: string;
}

const Overview = ({ title, value, maxValue, color }: OverviewProps) => {
  const percentage = Math.round((value / maxValue) * 100);
  
  const chartData = {
    labels: ['', ''],
    datasets: [
      {
        data: [value, maxValue - value],
        backgroundColor: [#008000, '#e5e7eb'],
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
      color: "#2720fd", 
    },
  ];

  return (
    <div className="w-full">
      {/* Top row with 2 circles */}
      <div className="flex justify-center gap-6 mb-4">
        <Overview
          title={vehicleStatuses[0].title}
          value={vehicleStatuses[0].value}
          maxValue={vehicleStatuses[0].maxValue}
          color={vehicleStatuses[0].color}
        />
      </div>
    </div>
  );
}