"use client";

import React from "react";

export default function StatusCardSlideDown({
  companyFilter,
  statusFilter,
  setStatusFilter,
  drawerOpen,
}: {
  companyFilter: string;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  drawerOpen: boolean;
}) {
  if (companyFilter === "All") return null;

  const statusOptions: Array<{ value: string; label: string; color: string }> =
    [
      { value: "All", label: "ทั้งหมด", color: "#6B7280" },
      { value: "available", label: "ว่าง", color: "#22C55E" },
      { value: "in_transit", label: "กำลังขนส่ง", color: "#EF4444" },
      { value: "broken", label: "เสีย", color: "#F59E0B" },
    ];

  return (
    <div
      className="absolute z-[9999] mt-14 bg-white rounded-xl shadow-lg p-4 w-40
      origin-top scale-y-100 transition-transform duration-300"
      style={{
        right: drawerOpen ? "410px" : "20px",
        transformOrigin: "top",
      }}
    >
      <h4 className="text-sm font-semibold mb-2 text-gray-700">สถานะ</h4>
      <div className="flex flex-col space-y-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`flex items-center space-x-2 px-3 py-1 rounded text-sm
              ${
                statusFilter === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <span
              className="inline-block h-3 w-3 rounded-full border border-white"
              style={{ backgroundColor: opt.color }}
            />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
