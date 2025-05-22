"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaBars, FaGlobeAsia, FaChevronLeft, FaCheckCircle, FaTruck, FaExclamationTriangle } from "react-icons/fa";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Dashboard from "./DashboardCards.js";
import { createTruckIcon, useLeafletIcons } from "./Icons";
import { ZoomControlPositionFix, MapZoomListener } from "./MapControls";
import Overview from "./Overview";
import CompanyBadgeFilter from "./CompanyBadgeFilter";
import StatusCardSlideDown from "./StatusCardSlideDown";
import VeicleOverview from "./VehicleOverview";
import shipmentsData from "../data/shipments.json";
import { RegionKey, regionNameMap } from "./constants";
import { Shipment } from "./constants";

// Dynamic imports for leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), { ssr: false });
const MarkerClusterGroup = dynamic(() => import("react-leaflet-markercluster"), { ssr: false });

// กำหนดพิกัดตามภูมิภาค
const regionCoordinates: Record<number, { center: [number, number]; zoom: number }> = {
  1: { center: [18.7883, 98.9853], zoom: 8 },   // เชียงใหม่ (ภาคเหนือ)
  2: { center: [16.4419, 102.8355], zoom: 8 },   // ขอนแก่น (ตะวันออกเฉียงเหนือ)
  3: { center: [14.0183, 100.525], zoom: 8 },    // อยุธยา/นครสวรรค์* (กลาง)
  4: { center: [13.7563, 100.5018], zoom: 11 },  // กรุงเทพฯ
  5: { center: [13.9020, 100.5303], zoom: 10 },  // ปริมณฑล (นนทบุรี/ปทุมธานี/สมุทรปราการ)
  6: { center: [13.3611, 100.9847], zoom: 8 },   // ชลบุรี (ตะวันออก)
  7: { center: [13.7957, 99.6110], zoom: 8 },    // กาญจนบุรี (ตะวันตก)
  8: { center: [9.1398, 99.3264], zoom: 8 }      // สุราษฎร์ธานี (ใต้)
};

interface LocationCoordinates {
  name: string;
  latitude: number;
  longitude: number;
}

// Interface สำหรับ props ของ MapWithCenter
interface MapWithCenterProps {
  mapCenter: [number, number]; // [latitude, longitude]
  zoomLevel: number;
}

// Component สำหรับอัพเดตตำแหน่งแผนที่อัตโนมัติ
const MapWithCenter: React.FC<MapWithCenterProps> = ({ mapCenter, zoomLevel }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.setView(mapCenter, zoomLevel);
    }
  }, [map, mapCenter, zoomLevel]);
  
  return null;
};

const fetchRoute = async (origin: [number, number], destination: [number, number]): Promise<[number, number][]> => {
  return [origin, destination];
};

interface CircleProgressProps {
  percent: number;
  color?: string;
  label?: string;
  size?: number;
}

function CircleProgress({ percent, color = "#00458a", label = " ", size = 90 }: CircleProgressProps) {
  const radius = size / 2 - 8;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray * (1 - percent / 100);
  return (
    <svg width={size} height={size} style={{ margin: "8px" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s" }}
      />
      <text x="50%" y="52%" textAnchor="middle" fontSize="1.3em" fontWeight="bold" fill={color}>
        {`${Math.round(percent)}%`}
      </text>
      <text x="50%" y="77%" textAnchor="middle" fontSize="0.9em" fill="#888">
        {label}
      </text>
    </svg>
  );
}

function regionTruckStats(regionId: number, shipments: Shipment[]) {
  // filter เฉพาะที่ truck.region === regionId
  const filtered = shipments.filter(s => s.truck && s.truck.region === regionId);
  let counts = { available: 0, in_transit: 0, broken: 0 };
  filtered.forEach(s => {
    if (s.status === "available") counts.available++;
    else if (s.status === "in_transit") counts.in_transit++;
    else if (s.status === "broken") counts.broken++;
  });
  const total = filtered.length || 1;
  return {
    ...counts,
    total,
    availablePercent: (counts.available / total) * 100,
    inTransitPercent: (counts.in_transit / total) * 100,
    brokenPercent: (counts.broken / total) * 100,
  };
}

export default function LogisticsOverview() {
  const mockShipmentsByRegion: Record<RegionKey, Shipment[]> = {
    north: [
      {
        id: "N-001",
        company: "TBL",
        support_phone: "1300-000-1234",
        origin: { name: "เชียงใหม่", latitude: 18.7883, longitude: 98.9853 },
        destination: {
          name: "เชียงราย",
          latitude: 19.9107,
          longitude: 99.8401,
        },
        departure_time: new Date().toISOString(),
        estimated_arrival_time: new Date(Date.now() + 3600000).toISOString(),
        distance_km: 200,
        estimated_duration_hours: 3.5,
        status: "in_transit",
        progress: 40,
        orders: [
          { orderId: "O001", item: "สินค้า A", quantity: 10 },
          { orderId: "O002", item: "สินค้า B", quantity: 5 },
        ],
        truck: {
          licensePlate: "1กก 1234",
          driverName: "สมชาย",
          driverPhone: "0812345678",
          truckClass: "6 ล้อ",
          region: 1,
          depot: "RDC เชียงใหม่",
        },
      },
      {
        id: "N-002",
        company: "SERMSUK",
        support_phone: "1300-000-1234",
        origin: { name: "ลำปาง", latitude: 18.2868, longitude: 99.4981 },
        destination: { name: "แพร่", latitude: 18.1443, longitude: 100.1411 },
        departure_time: new Date().toISOString(),
        estimated_arrival_time: new Date(Date.now() + 7200000).toISOString(),
        distance_km: 150,
        estimated_duration_hours: 2.5,
        status: "available",
        progress: 0,
        orders: [{ orderId: "O003", item: "สินค้า C", quantity: 8 }],
        truck: {
          licensePlate: "2กก 5678",
          driverName: "จารุ",
          driverPhone: "0898765432",
          truckClass: "10 ล้อ",
          region: 1,
          depot: "RDC ลำปาง",
        },
      },
    ],
    northeast: [
      {
        id: "NE-001",
        company: "HAVI",
        support_phone: "1300-000-1234",
        origin: { name: "ขอนแก่น", latitude: 16.4419, longitude: 102.8355 },
        destination: {
          name: "อุดรธานี",
          latitude: 17.4156,
          longitude: 102.785,
        },
        departure_time: new Date().toISOString(),
        estimated_arrival_time: new Date(Date.now() + 5400000).toISOString(),
        distance_km: 120,
        estimated_duration_hours: 2,
        status: "in_transit",
        progress: 60,
        orders: [
          { orderId: "O004", item: "สินค้า D", quantity: 12 },
          { orderId: "O005", item: "สินค้า E", quantity: 7 },
        ],
        truck: {
          licensePlate: "3กก 9012",
          driverName: "สมหญิง",
          driverPhone: "0823456789",
          truckClass: "6 ล้อ",
          region: 2,
          depot: "RDC ขอนแก่น",
        },
      },
    ],
    central: [
      {
        id: "C-001",
        company: "TBL",
        support_phone: "1300-000-1234",
        origin: { name: "นนทบุรี", latitude: 13.9125, longitude: 100.493 },
        destination: { name: "ปทุมธานี", latitude: 14.02, longitude: 100.5231 },
        departure_time: new Date().toISOString(),
        estimated_arrival_time: new Date(Date.now() + 3600000).toISOString(),
        distance_km: 50,
        estimated_duration_hours: 1,
        status: "available",
        progress: 0,
        orders: [{ orderId: "O006", item: "สินค้า F", quantity: 20 }],
        truck: {
          licensePlate: "4กก 3456",
          driverName: "สมชาย",
          driverPhone: "0834567890",
          truckClass: "10 ล้อ",
          region: 3,
          depot: "RDC นนทบุรี",
        },
      },
    ],
    south: [
      {
        id: "S-001",
        company: "SERMSUK",
        support_phone: "1300-000-1234",
        origin: { name: "สงขลา", latitude: 7.2035, longitude: 100.5974 },
        destination: { name: "ตรัง", latitude: 7.565, longitude: 99.6113 },
        departure_time: new Date().toISOString(),
        estimated_arrival_time: new Date(Date.now() + 5400000).toISOString(),
        distance_km: 180,
        estimated_duration_hours: 3,
        status: "broken",
        progress: 10,
        orders: [{ orderId: "O007", item: "สินค้า G", quantity: 15 }],
        truck: {
          licensePlate: "5กก 7890",
          driverName: "สมปอง",
          driverPhone: "0845678901",
          truckClass: "6 ล้อ",
          region: 4,
          depot: "RDC สงขลา",
        },
      },
    ],
  };

  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.7367, 100.5232]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<"All" | "TBL" | "SERMSUK" | "HAVI">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "available" | "in_transit" | "broken">("All");
  const [routes, setRoutes] = useState<Record<string, [number, number][]>>({});
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRegionRDC, setSelectedRegionRDC] = useState<RegionKey | null>(null);
  const [useLogo, setUseLogo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(7);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [secondaryDrawerOpen, setSecondaryDrawerOpen] = useState(false);
  const [selectedR, setSelectedR] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [truckIcons, setTruckIcons] = useState<Record<string, any>>({});
  const { iconsReady } = useLeafletIcons();

  const shipments: Shipment[] = shipmentsData.shipments;

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Preload truck icons when icons are ready
  useEffect(() => {
    if (iconsReady && isClient) {
      const loadIcons = async () => {
        const statuses = ['available', 'in_transit', 'broken'];
        const logoVariants = [true, false];
        const iconPromises: Promise<any>[] = [];

        for (const status of statuses) {
          for (const useLogo of logoVariants) {
            iconPromises.push(
              createTruckIcon(status, useLogo).then(icon => ({ 
                key: `${status}_${useLogo}`, 
                icon 
              }))
            );
          }
        }

        const loadedIcons = await Promise.all(iconPromises);
        const iconMap: Record<string, any> = {};
        loadedIcons.forEach(({ key, icon }) => {
          iconMap[key] = icon;
        });
        setTruckIcons(iconMap);
      };

      loadIcons();
    }
  }, [iconsReady, isClient]);

  useEffect(() => {
    if (!isClient) return;

    shipments.forEach((s) => {
      if (s.route && s.route.length > 0) {
        const coords = s.route.map((r) => [r.lat, r.lng] as [number, number]);
        setRoutes((r) => ({ ...r, [s.id]: coords }));
        setPositions((p) => ({ ...p, [s.id]: 0 }));
      } else {
        fetchRoute(
          [s.origin.latitude, s.origin.longitude],
          [s.destination.latitude, s.destination.longitude]
        ).then((coords) => {
          setRoutes((r) => ({ ...r, [s.id]: coords }));
          setPositions((p) => ({ ...p, [s.id]: 0 }));
        });
      }
    });
  }, [shipments, isClient]);

  const filtered = shipments
    .filter((s) => companyFilter === "All" || s.company === companyFilter)
    .filter((s) => statusFilter === "All" || s.status === statusFilter);

  const selectedShipment = selectedId
    ? shipments.find((s) => s.id === selectedId) || null
    : null;

  const regions = [
    { id: 1, name: "north", thaiName: "ภาคเหนือ" },
    { id: 2, name: "northeast", thaiName: "ภาคตะวันออกเฉียงเหนือ" },
    { id: 3, name: "central", thaiName: "ภาคกลาง" },
    { id: 4, name: "central", thaiName: "กรุงเทพมหานคร" },
    { id: 5, name: "central", thaiName: "ปริมณฑล" },
    { id: 6, name: "east", thaiName: "ภาคตะวันออก" },
    { id: 7, name: "west", thaiName: "ภาคตะวันตก" },
    { id: 8, name: "south", thaiName: "ภาคใต้" },
  ];

  const handleRegionSelect = (regionId: number) => {
    setSelectedR(regionId);
    setSecondaryDrawerOpen(true);
    
    // ซูมไปยังตำแหน่งที่กำหนดตาม regionId
    if (regionCoordinates[regionId]) {
      setMapCenter(regionCoordinates[regionId].center);
      setZoomLevel(regionCoordinates[regionId].zoom);
    }
  };

  const handleRegionSelected = (region: any) => {
    const regionName = encodeURIComponent(region.name);
    if (typeof window !== 'undefined') {
      window.location.href = `http://localhost:3000/region/${regionName}/rdc`;
    }
  };

  // Don't render map on server side or if icons aren't ready
  if (!isClient || !iconsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <button
        onClick={() => setDrawerOpen((v) => !v)}
        className="absolute top-4 left-4 z-50 bg-white p-2 rounded shadow-lg text-black"
        aria-label="Toggle drawer"
      >
        <svg
          className="text-2xl"
          fill="currentColor"
          viewBox="0 0 448 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 132h416c8.837 0 16-7.163 16-16V84c0-8.837-7.163-16-16-16H16C7.163 68 0 75.163 0 84v32c0 8.837 7.163 16 16 16zm416 68H16c-8.837 0-16 7.163-16 16v32c0 8.837 7.163 16 16 16h416c8.837 0 16-7.163 16-16v-32c0-8.837-7.163-16-16-16zm0 128H16c-8.837 0-16 7.163-16 16v32c0 8.837 7.163 16 16 16h416c8.837 0 16-7.163 16-16v-32c0-8.837-7.163-16-16-16z" />
        </svg>
      </button>

      {/* ปุ่ม logo */}
      <div
        className="fixed top-3 left-[calc(20px+80px)] z-[9999] flex items-center space-x-2 transition-all duration-300"
        style={{
          pointerEvents: "auto",
          left: drawerOpen ? 500 : 96,
        }}
      >
        <div
          onClick={() => setUseLogo((v) => !v)}
          className="cursor-pointer rounded p-1"
          title="Toggle Logo / Truck Icons"
        >
          <Image
            src="/logo58-removebg-preview.png"
            alt="Logo"
            width={225}
            height={128}
            className={`object-contain transition-transform duration-300 ${
              useLogo ? "opacity-100" : "opacity-100"
            }`}
            style={{ transformOrigin: "center" }}
          />
        </div>
      </div>

      <CompanyBadgeFilter
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        drawerOpen={drawerOpen}
        onToggleLogo={() => {}}
        useLogo={useLogo}
      />

      <StatusCardSlideDown
        companyFilter={companyFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        drawerOpen={drawerOpen}
      />

      <aside
        className={`bg-white p-6 shadow-2xl fixed top-16 right-8 max-w-sm w-96 rounded-3xl transition-transform duration-300 z-[999] text-black
    ${selectedRegionRDC ? "translate-x-0" : "translate-x-full"}
    backdrop-blur-md bg-white/70 border border-gray-200 overflow-y-auto`}
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)", maxHeight: "80vh" }}
      >
        {selectedRegionRDC && mockShipmentsByRegion[selectedRegionRDC] && (
          <>
            <button
              onClick={() => setSelectedRegionRDC(null)}
              className="text-gray-500 hover:text-gray-800 mb-4"
              aria-label="Close RDC detail"
            >
              ✕ Close
            </button>
            <h2 className="text-2xl font-bold mb-4">
              คลังกระจายสินค้า - {regionNameMap[selectedRegionRDC]}
            </h2>
            <p className="mb-4">
              จำนวนรถในคลัง: {mockShipmentsByRegion[selectedRegionRDC].length}{" "}
              คัน
            </p>

            {mockShipmentsByRegion[selectedRegionRDC].map((s) => (
              <div
                key={s.id}
                className="mb-6 p-4 bg-gray-100 rounded-xl shadow-inner"
              >
                <h3 className="font-semibold mb-2">{s.id}</h3>
                <p>
                  <strong>บริษัท:</strong> {s.company}
                </p>
                <p>
                  <strong>สถานะ:</strong> {s.status}
                </p>
                <p>
                  <strong>เวลาเข้า:</strong>{" "}
                  {new Date(s.departure_time).toLocaleString()}
                </p>
                <p>
                  <strong>ออเดอร์:</strong> {s.orders.length} รายการ
                </p>
                <p>
                  <strong>ความคืบหน้า:</strong> {s.progress}%
                </p>
              </div>
            ))}
          </>
        )}
      </aside>

      <aside
        className={`bg-white shadow-lg overflow-y-auto transform transition-all duration-300 flex ${
          drawerOpen ? "w-120" : "w-16"
        }`}
        style={{ height: "100vh" }}
      >
        {/* Left side with R1-R8 buttons - always visible */}
        <div className="flex flex-col items-center space-y-3 py-4 bg-gray-50 border-r border-gray-200">
          <div className="sticky top-0 p-2 mb-2">
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              className="bg-white p-2 rounded shadow-lg text-black flex items-center justify-center w-10 h-10"
              aria-label="Toggle drawer"
            >
              <FaBars className="text-xl" />
            </button>
          </div>

          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <button
              key={num}
              onClick={() => handleRegionSelect(num)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                selectedR === num
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={`R${num}`}
            >
              <span className="font-medium">R{num}</span>
            </button>
          ))}
        </div>

        {/* Main drawer content - conditionally visible */}
        {drawerOpen && (
          <div className="flex-1 p-4">
            <div className="sticky top-0 bg-white z-10 p-2 flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {selectedRegion ? selectedRegion.name : "ภาพรวมภูมิภาค"}
              </h1>

              <button
                onClick={() => setShowRegionSelector(!showRegionSelector)}
                className="bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center gap-2"
              >
                <FaGlobeAsia />
                <span>
                  {selectedRegion ? selectedRegion.name : "เลือกภูมิภาค"}
                </span>
              </button>
             
            </div>

            {!showRegionSelector ? (
              <div>
                <h2 className="text-lg font-semibold p-4 pb-0">
                  การเปรียบเทียบBU
                </h2>
                
                <Overview />
                <Dashboard />
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setShowRegionSelector(false)}
                    className="flex items-center text-blue-500 font-medium"
                  >
                    <FaChevronLeft className="mr-2" /> กลับ
                  </button>
                  <h2 className="text-xl font-semibold ml-4">เลือกภูมิภาค</h2>
                </div>

                <div className="space-y-2">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => handleRegionSelected(region)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedRegion && selectedRegion.id === region.id
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        <FaGlobeAsia className="mr-3 text-blue-500" />
                        <span className="font-medium">{region.thaiName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Secondary drawer - positioned relative to main drawer */}
      {secondaryDrawerOpen && (
        <aside
          className="bg-gradient-to-br from-white to-gray-50 p-6 shadow-xl fixed top-20 left-10 rounded-3xl transition-all duration-300 z-[99999] text-black opacity-90 animate-slideIn"
          style={{
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            height: "80vh",
            width: drawerOpen ? "calc(100% - 160px)" : "calc(100% - 56px)",
            maxWidth: "480px",
            left: drawerOpen ? "calc(100% - 1035px)" : "75px",
          }}
        >
          {/* ปุ่มปิดที่สวยขึ้น */}
          <button
            onClick={() => setSecondaryDrawerOpen(false)}
            className="flex items-center text-gray-500 hover:text-red-500 mb-4 transition-transform transform hover:scale-105"
            aria-label="Close secondary drawer"
          >
            <FaChevronLeft className="mr-2" /> กลับ
          </button>

          {/* หัวข้อที่โดดเด่น */}
          <h2 className="text-2xl font-bold mb-4 bg-blue-100 p-3 rounded-lg flex items-center justify-center shadow-md">
            <FaGlobeAsia className="mr-2 text-blue-500" />
            {`ข้อมูลของ R${selectedR}`}
          </h2>

          {selectedR && (() => {
            const stats = regionTruckStats(selectedR, shipments);
            return (
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <CircleProgress percent={stats.inTransitPercent} color="#f43f5e" label="ใช้งาน" />
                <CircleProgress percent={stats.brokenPercent} color="#FFCB00" label="ซ่อมบำรุง" />
                <CircleProgress percent={stats.availablePercent} color="#10b981" label="ว่าง" />

                {/* ส่วนสถิติด้านล่างในรูปแบบการ์ด */}
                <div className="bg-gray-50 p-4 rounded-xl shadow-md w-full mt-4 border border-gray-200">
                  <div className="flex flex-col gap-2">
                    <div className="text-xl font-semibold">สรุปข้อมูล R{selectedR}</div>
                    <div>รวมรถ: <b>{stats.total}</b> คัน</div>
                    <div className="text-rose-600 flex items-center">
                      <FaCheckCircle className="mr-2" /> ใช้งาน: {stats.in_transit} คัน
                    </div>
                    <div className="text-[#FFCB00] flex items-center">
                      <FaExclamationTriangle className="mr-2" /> ซ่อมบำรุง: {stats.broken} คัน
                    </div>
                    <div className="text-green-700 flex items-center">
                      <FaTruck className="mr-2" /> ว่าง: {stats.available} คัน
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </aside>
      )}

      <div className="flex-1">
        {isClient && (
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            style={{ height: "100vh", width: "100%" }}
          >
            <ZoomControlPositionFix />
            <MapZoomListener setZoomLevel={setZoomLevel} />
            <MapWithCenter mapCenter={mapCenter} zoomLevel={zoomLevel} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Show routes */}
            {selectedShipment?.status === "in_transit" &&
              routes[selectedShipment.id] && (
                <Polyline
                  positions={routes[selectedShipment.id]!}
                  pathOptions={{ color: "#1100ff", weight: 6, opacity: 0.8 }}
                />
              )}

            {/* MarkerClusterGroup with all markers shown when clicked */}
            <MarkerClusterGroup
              disableClusteringAtZoom={10}
              showCoverageOnHover={false}
              maxClusterRadius={50}
              onClick={() => setZoomLevel(10)}
            >
              {filtered.map((shipment) => {
                const coords = routes[shipment.id];
                const idx = positions[shipment.id] || 0;
                const pos: [number, number] = coords
                  ? coords[idx]
                  : [shipment.origin.latitude, shipment.origin.longitude];

                const iconKey = `${shipment.status}_${useLogo}`;
                const icon = truckIcons[iconKey];

                if (!icon) return null; // Don't render marker if icon isn't loaded yet

                return (
                  <Marker
                    key={shipment.id}
                    position={pos}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedId(shipment.id);
                        setZoomLevel(10);
                      },
                    }}
                  >
                    <Popup>
                      <strong>{shipment.id}</strong>
                      <br />
                      Company: {shipment.company}
                      <br />
                      Status: {shipment.status}
                      <br />
                      Support Tel: {shipment.support_phone}
                      <br />
                      Progress: {shipment.progress}%<br />
                      Orders:
                      <ul className="list-disc ml-4">
                        {shipment.orders.map((order) => (
                          <li key={order.orderId}>
                            {order.orderId}: {order.item} ×{order.quantity}
                          </li>
                        ))}
                      </ul>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>

      <aside
        className={`bg-white p-6 shadow-2xl fixed top-16 right-8 max-w-sm w-80 rounded-3xl transition-transform duration-300 z-[999] text-black
          ${
            selectedShipment && !selectedRegionRDC
              ? "translate-x-0"
              : "translate-x-full"
          }
          backdrop-blur-md bg-white/70 border border-gray-200`}
        style={{
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          maxHeight: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedShipment && !selectedRegionRDC ? (
          <>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/90 pb-2 border-b border-gray-100">
              <h2 className="text-2xl font-bold">{selectedShipment.id}</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="text-gray-500 hover:text-gray-800 flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
                aria-label="Close shipment detail"
              >
                ✕
              </button>
            </div>

            <div
              className="overflow-y-auto flex-grow pr-1"
              style={{ scrollbarWidth: "thin" }}
            >
              <p className="mb-1">
                <strong>บริษัท:</strong> {selectedShipment.company}
              </p>
              <p className="mb-1">
                <strong>ติดต่อขอใช้รถโทร:</strong> {selectedShipment.support_phone}
              </p>
              <p className="mb-1">
                <strong>สถานะ:</strong>{" "}
                {{
                  available: "ว่าง",
                  in_transit: "กำลังขนส่ง",
                  broken: "เสีย",
                  All: "ทั้งหมด",
                }[selectedShipment.status] || selectedShipment.status}
              </p>
              <p className="mb-1">
                <strong>ความคืบหน้า:</strong> {selectedShipment.progress}%
              </p>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="h-4 bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${selectedShipment.progress}%` }}
                />
              </div>

              <p className="mb-1">
                <strong>ต้นทาง:</strong> {selectedShipment.origin.name}
              </p>
              <p className="mb-1">
                <strong>ปลายทาง:</strong> {selectedShipment.destination.name}
              </p>
              <p className="mb-1">
                <strong>ออกเดินทาง:</strong>{" "}
                {new Date(selectedShipment.departure_time).toLocaleString()}
              </p>
              <p className="mb-4">
                <strong>ถึงโดยประมาณ:</strong>{" "}
                {new Date(
                  selectedShipment.estimated_arrival_time
                ).toLocaleString()}
              </p>

              {selectedShipment.truck && (
                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800">ข้อมูลรถ</h3>
                  <p>
                    <strong>ทะเบียน:</strong>{" "}
                    {selectedShipment.truck.licensePlate}
                  </p>
                  <p>
                    <strong>คนขับ:</strong> {selectedShipment.truck.driverName}
                  </p>
                  <p>
                    <strong>โทรศัพท์:</strong>{" "}
                    <a
                      href={`tel:0${selectedShipment.truck.driverPhone}`}
                      className="text-blue-600 underline"
                      aria-label={`โทรหา 0${selectedShipment.truck.driverName}`}
                    >
                      0{selectedShipment.truck.driverPhone}
                    </a>
                  </p>
                  <p>
                    <strong>ประเภท:</strong> {selectedShipment.truck.truckClass}
                  </p>
                  <p>
                    <strong>ฐานจอดรถ:</strong> {selectedShipment.truck.depot}
                  </p>
                  <p>
                    <strong>ภูมิภาค #:</strong> {selectedShipment.truck.region}
                  </p>
                </div>
              )}

              <div className="mb-4 bg-green-50 p-3 rounded-lg">
                <h3 className="font-semibold mb-1 text-green-800">
                  คำสั่งซื้อ:
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedShipment.orders.map((o) => (
                    <li key={o.orderId}>
                      <strong>{o.orderId}</strong>: {o.item} ×{o.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="mb-1">
                  <strong>ระยะทาง:</strong>{" "}
                  {selectedShipment.distance_km.toFixed(1)} กม.
                </p>
                <p>
                  <strong>ระยะเวลาที่คาด:</strong>{" "}
                  {selectedShipment.estimated_duration_hours.toFixed(1)} ชม.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </aside>
      
      <aside
        className={` p-6  fixed bottom-5 right-8 max-w-sm w-120 rounded-3xl transition-transform duration-300 z-[999] text-black `}
      >
        <div>
          <VeicleOverview />
        </div>
      </aside>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        @media (max-width: 768px) {
          aside.bg-gray-100 {
            width: 80px !important;
          }
          aside.bg-white.p-6.shadow-2xl.fixed.top-16.right-8.max-w-sm.w-96.rounded-3xl {
            width: 100vw !important;
            height: 60vh !important;
            max-height: 60vh !important;
            border-radius: 1rem 1rem 0 0 !important;
            bottom: 0;
            top: auto !important;
            right: 0 !important;
            overflow-y: auto !important;
            z-index: 10000 !important;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
            transition: transform 0.3s ease-in-out;
          }
          aside.bg-white.p-6.shadow-2xl.fixed.top-16.right-8.max-w-sm.w-80.rounded-3xl {
            width: 100vw !important;
            height: 60vh !important;
            max-height: 60vh !important;
            border-radius: 1rem 1rem 0 0 !important;
            bottom: 0;
            top: auto !important;
            right: 0 !important;
            overflow-y: auto !important;
            z-index: 10000 !important;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
            transition: transform 0.3s ease-in-out;
          }
          button[aria-label="Toggle drawer"] {
            top: 1rem !important;
            left: 1rem !important;
            z-index: 11000 !important;
          }
        }
      `}</style>
    </div>
  );
}