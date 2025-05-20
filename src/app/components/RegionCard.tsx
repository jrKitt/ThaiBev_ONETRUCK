"use client";

import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { PieChart, Pie, Cell } from "recharts";

interface Metric {
  label: string;
  value: number;
  positive: boolean;
}

export default function RegionCard({
  regionName,
  metrics,
  weeklySales,
  totalSales,
  totalChange,
  onClick,
}: {
  regionName: string;
  metrics: Metric[];
  weeklySales: number;
  totalSales: number;
  totalChange: number;
  onClick?: () => void;
}) {
  const COLORS = ["#0066CC", "#0099FF", "#004a94", "#b7dbff"];
  const data = metrics.map((m, i) => ({
    name: m.label,
    value: m.value,
    fill: COLORS[i % COLORS.length],
  }));
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-black"
    >
      <h2 className="text-xl font-bold mb-3">{regionName}</h2>
      <div className="flex">
        <div className="relative w-1/2 flex justify-center items-center">
          <PieChart width={100} height={100}>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={30}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={data[idx].fill} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute text-center">
            <div className="text-lg font-bold">{weeklySales}k</div>
            <div className="text-xs text-gray-500">ยอดรายสัปดาห์</div>
          </div>
        </div>
        <div className="w-1/2 pl-3 space-y-1">
          {metrics.map((m) => (
            <div key={m.label} className="flex justify-between text-sm">
              <span>{m.label}</span>
              <span
                className={`flex items-center ${
                  m.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                {m.positive ? <FaArrowUp /> : <FaArrowDown />}{" "}
                {Math.abs(m.value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t my-4" />
      <div className="flex justify-between">
        <span>ยอดรวม 7 วัน</span>
        <span
          className={`flex items-center ${
            totalChange >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {totalChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}{" "}
          {Math.abs(totalChange).toFixed(1)}%
        </span>
      </div>
    </button>
  );
}
