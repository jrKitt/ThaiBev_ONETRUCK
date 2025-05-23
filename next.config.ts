/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ข้าม TypeScript build error
  },
  eslint: {
    ignoreDuringBuilds: true, // ข้าม ESLint error ตอน build
  },
  devIndicators: false
};

module.exports = nextConfig;
