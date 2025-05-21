"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaBars, FaGlobeAsia, FaChevronLeft } from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import Dashboard from "./DashboardCards.js";
import { truckIcon } from "./Icons";
import { ZoomControlPositionFix, MapZoomListener } from "./MapControls";
import Overview from './Overview';
import CompanyBadgeFilter from "./CompanyBadgeFilter";
import StatusCardSlideDown from "./StatusCardSlideDown";
import VeicleOverview from "./VehicleOverview";
import shipmentsData from "../data/shipments.json";
import { RegionKey, regionNameMap } from "./constants";
import BarChart from "./BarChart";
interface TruckInfo {
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  truckClass: string;
  region: number;
  depot: string;
}
interface Shipment {
  id: string;
  company: "TBL" | "SERMSUK" | "HAVI" | "All";
  origin: { name: string; latitude: number; longitude: number };
  destination: { name: string; latitude: number; longitude: number };
  departure_time: string;
  estimated_arrival_time: string;
  distance_km: number;
  estimated_duration_hours: number;
  status: "All" | "available" | "in_transit" | "broken";
  progress: number;
  orders: { orderId: string; item: string; quantity: number }[];
  route?: { lat: number; lng: number }[];
  truck?: TruckInfo;
}

async function fetchRoute(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> {
  try {
    const res = await fetch(
      `/api/route?start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`
    );
    if (!res.ok) {
      console.warn(
        `Route fetch failed [${res.status}], falling back to local route`
      );
      return [];
    }
    const json = await res.json();
    return json.features[0].geometry.coordinates.map((c: [number, number]) => [
      c[1],
      c[0],
    ]);
  } catch (e) {
    console.warn("Route fetch exception, falling back to local route", e);
    return [];
  }
}

const styleSheet = `
@keyframes slideDownFade {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

export default function LogisticsOverview() {


  const mockShipmentsByRegion: Record<RegionKey, Shipment[]> = {
    north: [
      {
        id: "N-001",
        company: "TBL",
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<
    "All" | "TBL" | "SERMSUK" | "HAVI"
  >("All");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "available" | "in_transit" | "broken"
  >("All");
  const [routes, setRoutes] = useState<Record<string, [number, number][]>>({});
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRegionRDC, setSelectedRegionRDC] = useState<RegionKey | null>(
    null
  );
  const [useLogo, setUseLogo] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(7);

  const shipments: Shipment[] = shipmentsData.shipments;

  useEffect(() => {
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
  }, [shipments]);

  const filtered = shipments
    .filter((s) => companyFilter === "All" || s.company === companyFilter)
    .filter((s) => statusFilter === "All" || s.status === statusFilter);

  const selectedShipment = selectedId
    ? shipments.find((s) => s.id === selectedId) || null
    : null;

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styleSheet;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);
  const chartData = [
    { name: "2016", value: 350 },
    { name: "2017", value: 400 },
    { name: "2018", value: 550 },
    { name: "2019", value: 700 },
    { name: "2020", value: 1050 },
    { name: "2021", value: 1200 },
    { name: "2022", value: 1400 },
  ];
  const regions = [
  { id: 1, name: "Northern" },
  { id: 2, name: "Central" },
  { id: 3, name: "Northeastern" },
  { id: 4, name: "Western" },
  { id: 5, name: "Southern" }
];
  // const [drawerOpen, setDrawerOpen] = useState(true);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  

    const handleRegionSelect = (region) => {
    // setSelectedRegion(region);
    // setShowRegionSelector(false);
    const regionName = encodeURIComponent(region.name);
  window.location.href = `http://localhost:3000/region/${regionName}/rdc`;
  };
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
          // style={{
          //   width: 64,
          //   height: 64,
          //   display: "flex",
          //   alignItems: "center",
          //   justifyContent: "center",
          // }}
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
      className={`bg-white shadow-lg overflow-y-auto transform transition-all duration-300 ${
        drawerOpen ? "w-120" : "w-16"
      }`}
      style={{ height: "100vh", }}
    >
      <div className="sticky top-0 bg-white z-10 p-2 flex justify-between items-center">
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className="bg-white p-2 rounded shadow-lg text-black flex items-center justify-center w-10 h-10"
          aria-label="Toggle drawer"
        >
          <FaBars className="text-xl" />
        </button>
        
        {drawerOpen && (
          <button
            onClick={() => setShowRegionSelector(!showRegionSelector)}
            className="bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FaGlobeAsia />
            <span>{selectedRegion ? selectedRegion.name : "เลือกภูมิภาค"}</span>
          </button>
        )}
      </div>

      {drawerOpen && !showRegionSelector && (
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center mb-6">
            {selectedRegion ? selectedRegion.name : "ภาพรวมภูมิภาค"}
          </h1>

          {/* Bar Chart Card */}
            {/* <h2 className="text-lg font-semibold m-3 pb-0">
              การเปรียบเทียบภูมิภาค
            </h2> */}
            <div className="m-3"><Overview/></div>
             <Dashboard/>
          </div>

      )}

      {/* Region Selector Screen */}
      {drawerOpen && showRegionSelector && (
        <div className="p-4">
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
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => handleRegionSelect(region)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRegion && selectedRegion.id === region.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <FaGlobeAsia className="mr-3 text-blue-500" />
                  <span className="font-medium">{region.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>

      <div className="flex-1">
        <MapContainer
          center={[13.7367, 100.5232]}
          zoom={7}
          style={{ height: "100vh", width: "100%" }}
        >
          <ZoomControlPositionFix />
          <MapZoomListener setZoomLevel={setZoomLevel} />

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {selectedShipment?.status === "in_transit" &&
            routes[selectedShipment.id] && (
              <Polyline
                positions={routes[selectedShipment.id]!}
                pathOptions={{ color: "#1100ff", weight: 6, opacity: 0.8 }}
              />
            )}

          <MarkerClusterGroup
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();

              let color = "rgba(255, 99, 99, 0.7)";
              if (count >= 100) color = "rgba(234, 12, 12, 0.7)";

              const size = count > 100 ? 48 : 36;
              const fontSize = count > 100 ? 16 : 14;

              return new L.DivIcon({
                html: `
                  <div style="
                    position: relative;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: ${color};
                    box-shadow: 0 0 8px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                    font-weight: 600;
                    font-size: ${fontSize}px;
                    user-select: none;
                    cursor: pointer;
                  ">
                    ${count}
                  </div>
                `,
                className: "",
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
              });
            }}
          >
            {filtered.map((s) => {
              const coords = routes[s.id];
              const idx = positions[s.id] || 0;
              const pos: [number, number] = coords
                ? coords[idx]
                : [s.origin.latitude, s.origin.longitude];
              return (
                <Marker
                  key={s.id}
                  position={pos}
                  icon={truckIcon(s.status, useLogo)}
                  eventHandlers={{
                    click: () => {
                      setSelectedId(s.id);
                      setSelectedRegionRDC(null);
                    },
                  }}
                >
                  <Popup>
                    <strong>{s.id}</strong>
                    <br />
                    Company: {s.company}
                    <br />
                    Status: {s.status}
                    <br />
                    Progress: {s.progress}%<br />
                    Orders:
                    <ul className="list-disc ml-4">
                      {s.orders.map((o) => (
                        <li key={o.orderId}>
                          {o.orderId}: {o.item} ×{o.quantity}
                        </li>
                      ))}
                    </ul>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <aside
        className={`bg-white p-6 shadow-2xl fixed top-16 right-8 max-w-sm w-96 rounded-3xl transition-transform duration-300 z-[999] text-black
          ${selectedRegionRDC ? "translate-x-0" : "translate-x-full"}
          backdrop-blur-md bg-white/70 border border-gray-200 overflow-y-auto`}
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)", maxHeight: "80vh" }}
      >
        {selectedRegionRDC && (
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
                  <strong>สถานะ:</strong>{" "}
                  {{
                    available: "ว่าง",
                    in_transit: "กำลังขนส่ง",
                    broken: "เสีย",
                    All: "ทั้งหมด",
                  }[s.status] || s.status}
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
        className={`bg-white p-6 shadow-2xl fixed top-16 right-8 max-w-sm w-80 rounded-3xl transition-transform duration-300 z-[999] text-black
          ${
            selectedShipment && !selectedRegionRDC
              ? "translate-x-0"
              : "translate-x-full"
          }
          backdrop-blur-md bg-white/70 border border-gray-200`}
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
      >
        {selectedShipment && !selectedRegionRDC ? (
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-500 hover:text-gray-800 mb-4"
              aria-label="Close shipment detail"
            >
              ✕ Close
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedShipment.id}</h2>
            <p className="mb-1">
              <strong>บริษัท:</strong> {selectedShipment.company}
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
              <div className="mb-4">
                <h3 className="font-semibold mb-2">ข้อมูลรถ</h3>
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

            <div className="mb-4">
              <h3 className="font-semibold mb-1">คำสั่งซื้อ:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedShipment.orders.map((o) => (
                  <li key={o.orderId}>
                    <strong>{o.orderId}</strong>: {o.item} ×{o.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-1">
                <strong>ระยะทาง:</strong>{" "}
                {selectedShipment.distance_km.toFixed(1)} กม.
              </p>
              <p>
                <strong>ระยะเวลาที่คาด:</strong>{" "}
                {selectedShipment.estimated_duration_hours.toFixed(1)} ชม.
              </p>
            </div>
          </>
        ) : null}
      </aside>
      <aside
        className={`bg-white p-6 shadow-2xl fixed bottom-5 right-8 max-w-sm w-80 rounded-3xl transition-transform duration-300 z-[999] text-black
         
          backdrop-blur-md bg-white/70 border border-gray-200`}
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
      >
        <div>
          <h2 className="text-2xl font-bold mb-16 text-end">Truck status</h2>

          <VeicleOverview />
        </div>
      </aside>

      <style jsx>{`
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
