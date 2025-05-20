"use client";

import React from "react";
import { companies } from "./constants";

export default function CompanyBadgeFilter({
  companyFilter,
  setCompanyFilter,
  drawerOpen,

}: {
  companyFilter: string;
  setCompanyFilter: (v: string) => void;
  drawerOpen: boolean;
  onToggleLogo: () => void;
  useLogo: boolean;
}) {
  return (
    <div
      className="fixed top-3 right-4 z-[9999] flex items-center space-x-2 transition-all duration-300"
      style={{
        pointerEvents: "auto",
        right: drawerOpen ? "400px" : "20px",
      }}
    >
      {companies.map(({ id, label, color }) => (
        <button
          key={id}
          onClick={() => setCompanyFilter(id)}
          className={`relative px-4 py-1 rounded-full font-semibold text-sm transition
            ${
              companyFilter === id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          style={{
            borderColor: companyFilter === id ? color : "transparent",
            borderWidth: 1,
            borderStyle: "solid",
          }}
        >
          <span
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full border border-white"
            style={{
              backgroundColor: companyFilter === id ? color : "#bbb",
            }}
          />
          {label}
        </button>
      ))}
    </div>
  );
}
