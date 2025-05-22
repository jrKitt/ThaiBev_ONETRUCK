"use client";
import dynamic from "next/dynamic";

const LogisticsOverviewClient = dynamic(
  () => import("./LogisticsOverviewClient"),
  { ssr: false } // ปิด SSR สำหรับ component นี้
);

export default function LogisticsOverview() {
  return <LogisticsOverviewClient />;
}
