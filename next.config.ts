import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ข้าม error ตอน build แต่ไม่แนะนำใช้ใน production
    ignoreBuildErrors: true,
  },
  // สามารถเพิ่ม config อื่น ๆ ได้ตรงนี้
};

export default nextConfig;
