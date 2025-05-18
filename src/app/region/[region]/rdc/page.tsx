"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

type RegionKey = "north" | "northeast" | "central" | "south";

const regionData: Record<RegionKey, { label: string; rdcs: string[] }> = {
  north: { label: "ภาคเหนือ", rdcs: ["RDC 1", "RDC 2", "RDC 3"] },
  northeast: {
    label: "ภาคตะวันออกเฉียงเหนือ",
    rdcs: ["RDC 1", "RDC 2", "RDC 3"],
  },
  central: { label: "ภาคกลาง", rdcs: ["RDC 1", "RDC 2", "RDC 3"] },
  south: { label: "ภาคใต้", rdcs: ["RDC 1", "RDC 2", "RDC 3"] },
};

interface RDCSelectorPageProps {
  params: { region: RegionKey };
}

export default function RDCSelectorPage({ params }: RDCSelectorPageProps) {
  const { region } = params;
  if (!region || !(region in regionData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <p className="text-gray-500">ไม่พบข้อมูลภูมิภาค</p>
      </div>
    );
  }

  const { label, rdcs } = regionData[region];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 flex items-center text-blue-600 hover:underline"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        กลับ
      </button>

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {label} – เลือก RDC
      </h1>

      {/* RDC Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        {rdcs.map((rdc) => (
          <div
            key={rdc}
            onClick={() => {
              //window.location.href = `/dashboard/${region}/${encodeURIComponent(rdc )}`;
              window.location.href = `/Dashboard`;
            }}
            className="cursor-pointer flex items-center p-4 bg-gradient-to-r from-[#004E92] via-[#0066CC] to-[#0099FF] text-white rounded-lg shadow-lg hover:opacity-90 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="flex-shrink-0 size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
              />
            </svg>

            <span className="ml-3 text-lg font-semibold">{rdc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
