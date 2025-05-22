// 'use client';
// import React, { useState, useEffect } from "react";
// import { FaSearch } from "react-icons/fa";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Polyline,
//   useMap,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// // import Sidebar from "../components/Sidebar";

// // Mock data พร้อมเส้นทาง (route) และข้อมูลลูกค้า/ปลายทาง
// const initialVehicles = [
//   {
//     id: "VOL-342808",
//     location: "Chelsea, Bangkok, TH",
//     destination: "โรงพยาบาลกรุงเทพ",
//     customer: "คุณสมชาย",
//     progress: 88,
//     route: [
//       [13.7465, 100.5328],
//       [13.7500, 100.5380],
//       [13.7550, 100.5430],
//       [13.7600, 100.5470],
//     ],
//     routeIndex: 0,
//   },
//   {
//     id: "VOL-954784",
//     location: "อุดรธานี, TH",
//     destination: "ศูนย์กระจายสินค้าอุดรธานี",
//     customer: "คุณอุดร",
//     progress: 43,
//     route: [
//       [17.4100, 102.7800],
//       [17.4120, 102.7850],
//       [17.4140, 102.7900],
//     ],
//     routeIndex: 0,
//   },
//   {
//     id: "VOL-343908",
//     location: "Samut Prakan, TH",
//     destination: "โรงงานสมุทรปราการ",
//     customer: "คุณสมปอง",
//     progress: 10,
//     route: [
//       [13.5991, 100.5967],
//       [13.6050, 100.6000],
//     ],
//     routeIndex: 0,
//   },
// ];

// // เลือกสีตาม progress
// function getStatusColor(progress: number) {
//   if (progress >= 80) return "#22C55E";   // เขียว
//   if (progress >= 50) return "#F59E0B";   // เหลือง
//   return "#EF4444";                       // แดง
// }

// // สร้าง DivIcon ให้เป็นวงกลม 🚚
// function createTruckIcon(progress: number) {
//   const color = getStatusColor(progress);
//   const html = `
//     <div style="
//       background: ${color};
//       width: 32px; height: 32px;
//       border-radius: 50%;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       border: 2px solid white;
//       font-size: 18px;
//     ">🚚</div>
//   `;
//   return new L.DivIcon({
//     html,
//     className: "",
//     iconSize: [32, 32],
//     iconAnchor: [16, 16],
//     popupAnchor: [0, -16],
//   });
// }

// // Component ซ้อนสำหรับ Marker เพื่อใช้ useMap()
// function MapMarkers({
//   vehicles,
//   onSelect,
// }: {
//   vehicles: typeof initialVehicles;
//   onSelect: (v: typeof initialVehicles[0]) => void;
// }) {
//   const map = useMap();
//   return (
//     <>
//       {vehicles.map((v) => (
//         <Marker
//           key={v.id}
//           position={v.route[v.routeIndex] as [number, number]}
//           icon={createTruckIcon(v.progress)}
//           eventHandlers={{
//             click: () => {
//               map.flyTo(v.route[v.routeIndex], 15, { animate: true });
//               onSelect(v);
//             },
//           }}
//         >
//           <Popup>
//             <strong>{v.id}</strong>
//             <br />
//             ปลายทาง: {v.destination}
//             <br />
//             ลูกค้า: {v.customer}
//           </Popup>
//         </Marker>
//       ))}
//     </>
//   );
// }

// export default function FleetPage() {
//   const [vehicles, setVehicles] = useState(initialVehicles);
//   const [selected, setSelected] = useState(initialVehicles[0]);
//   const [search, setSearch] = useState("");

//   // Simulate real-time movement
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setVehicles((prev) =>
//         prev.map((v) => {
//           const nextIndex = (v.routeIndex + 1) % v.route.length;
//           return {
//             ...v,
//             routeIndex: nextIndex,
//           };
//         })
//       );
//     }, 3000);
//     return () => clearInterval(timer);
//   }, []);

//   const filtered = vehicles.filter((v) =>
//     v.id.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-black">
//       <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 p-4">
//         {/* <h2 className="text-lg font-semibold mb-4">GPS TRACKING SYSTEM</h2>

//         <div className="mb-4 relative">
//           <input
//             type="text"
//             placeholder="ค้นหา Tracking ID..."
//             className="w-full p-2 pl-10 border rounded-lg text-sm"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
//         </div>

//         <div className="space-y-6">
//           <div>
//             <p className="font-semibold flex items-center gap-2">
//               <span
//                 className="w-3 h-3 rounded-full inline-block"
//                 style={{ background: getStatusColor(selected.progress) }}
//               />
//               {selected.id}
//             </p>
//             <p className="text-sm text-gray-600">{selected.location}</p>
//             <p className="text-sm mt-1">ปลายทาง: {selected.destination}</p>
//             <p className="text-sm">ลูกค้า: {selected.customer}</p>

//             <div className="mt-4">
//               <p className="text-sm mb-1">ความคืบหน้า</p>
//               <div className="w-full h-2 bg-gray-200 rounded">
//                 <div
//                   className="h-2 rounded"
//                   style={{
//                     width: `${selected.progress}%`,
//                     background: getStatusColor(selected.progress),
//                   }}
//                 />
//               </div>
//               <p className="text-right text-xs text-gray-600 mt-1">
//                 {selected.progress}%
//               </p>
//             </div>
//           </div>

//           <div className="mt-6">
//             {filtered.map((v) => (
//               <div
//                 key={v.id}
//                 className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition
//                   ${
//                     selected.id === v.id
//                       ? "bg-gray-100 font-semibold"
//                       : "hover:bg-gray-100"
//                   }
//                 `}
//                 onClick={() => setSelected(v)}
//               >
//                 <span
//                   className="w-4 h-4 rounded-full inline-block"
//                   style={{ background: getStatusColor(v.progress) }}
//                 />
//                 <div>
//                   <p>{v.id}</p>
//                   <p className="text-xs text-gray-500">{v.location}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 relative">
//         <MapContainer
//           center={[13.7367, 100.5232]}
//           zoom={11}
//           style={{ height: "100vh", width: "100%" }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution="© OpenStreetMap contributors"
//           />

//           {/* แสดงเส้นทางของรถที่เลือกเป็นสีเขียว */}
//           {/* {selected && (
//             <Polyline
//               positions={selected.route}
//               pathOptions={{ color: "green", weight: 4 }}
//             />
//           )}

//           <MapMarkers vehicles={vehicles} onSelect={(v) => setSelected(v)} />
//         </MapContainer> */} */
//       </div>
//     </div>
//   );
// }
