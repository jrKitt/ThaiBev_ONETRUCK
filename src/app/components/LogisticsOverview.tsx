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
import Overview from "./Overview";
import CompanyBadgeFilter from "./CompanyBadgeFilter";
import StatusCardSlideDown from "./StatusCardSlideDown";
import VeicleOverview from "./VehicleOverview";
import shipmentsData from "../data/shipments.json";
import { RegionKey, regionNameMap } from "./constants";
import { Shipment } from "./constants";
const regionCoordinates = {
  1: { center: [18.7883, 98.9853], zoom: 7 },
  2: { center: [16.4419, 102.8355], zoom: 7 },
  3: { center: [13.9125, 100.493], zoom: 7 },
  4: { center: [7.2035, 100.5974], zoom: 7 },
  // Add more regions as necessary
};
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
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.7367, 100.5232]);
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

  const regions = [
    { id: 1, name: "ภาคเหนือ" },
    { id: 2, name: "ภาคกลาง" },
    { id: 3, name: "ภาคตะวันออก" },
    { id: 4, name: "ภาคตะวันตก" },
    { id: 5, name: "ภาคใต้" },
  ];
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  const [selectedR, setSelectedR] = useState(null);
  console.log(setSelectedR);

  const handleRegionSelect = (regionId) => {
    setSelectedRegion(regionId);
    const { center, zoom } = regionCoordinates[regionId] || {};
    if (center) {
      setMapCenter(center);
      setZoomLevel(zoom);
    }
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
          className="cursor-pointer rounded p-1 shadow hover:shadow-lg bg-white"
          style={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Toggle Logo / Truck Icons"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={128}
            height={128}
            className={`object-contain transition-transform duration-300 ${
              useLogo ? "opacity-100" : "opacity-50"
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
        style={{ height: "100vh" }}
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
              <span>
                {selectedRegion ? selectedRegion.name : "เลือกภูมิภาค"}
              </span>
            </button>
          )}
        </div>

        {/* R1-R8 Menu when sidebar is collapsed */}
        {!drawerOpen && (
          <div className="flex flex-col items-center mt-4 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                onClick={() => setShowRegionSelector(!showRegionSelector)}

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
        )}

        {/* R1-R8 Menu when sidebar is open */}
        {drawerOpen && !showRegionSelector && (
          <div className="p-4">
            <h1 className="text-2xl font-bold text-center mb-6">
              {selectedRegion ? selectedRegion.name : "ภาพรวมภูมิภาค"}
            </h1>

            {/* R1-R8 Selection Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRegionSelect(num)}
                  className={`p-4 rounded-lg transition-all flex items-center justify-center ${
                    selectedR === num
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="text-center">
                    <span className="font-bold text-lg">R{num}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Bar Chart Card */}
            <h2 className="text-lg font-semibold p-4 pb-0">
              การเปรียบเทียบภูมิภาค
            </h2>
            <Overview />
            <Dashboard />
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
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionSelect(region)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedRegion && selectedRegion.id === region.id
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
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
          center={mapCenter} // ใช้ค่า mapCenter ที่มีการอัพเดต
          zoom={zoomLevel} // ใช้ค่า zoomLevel ที่มีการอัพเดต
          style={{ height: "100vh", width: "100%" }}
        >
          <ZoomControlPositionFix />
          <MapZoomListener setZoomLevel={setZoomLevel} />
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
            disableClusteringAtZoom={10} // Disable clustering when zoom is greater than level 10
            showCoverageOnHover={false} // Disable hover behavior
          >
            {filtered.map((shipment) => {
              const coords = routes[shipment.id];
              const idx = positions[shipment.id] || 0;
              const pos: [number, number] = coords
                ? coords[idx]
                : [shipment.origin.latitude, shipment.origin.longitude];
              return (
                <Marker
                  key={shipment.id}
                  position={pos}
                  icon={truckIcon(shipment.status, useLogo)}
                  eventHandlers={{
                    click: () => {
                      setSelectedId(shipment.id);
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
        style={{
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          maxHeight: "calc(100vh - 120px)", // Set max height to viewport height minus some padding
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
        className={`bg-white p-6 shadow-2xl fixed bottom-30 right-8 max-w-sm w-80 rounded-3xl transition-transform duration-300 z-[999] text-black
         
          backdrop-blur-md bg-white/70 border border-gray-200`}
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
      >
        <div>
          <h2 className="text-2xl font-bold mb-2">ภาพรวมรถทั้งหมด</h2>

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
