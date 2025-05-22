'use client';

import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

function getStatusColor(progress: number) {
  if (progress >= 80) return "#22C55E";
  if (progress >= 50) return "#F59E0B";
  return "#EF4444";
}

function createTruckIcon(progress: number) {
  const color = getStatusColor(progress);
  const html = `
    <div style="
      background: ${color};
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      font-size: 18px;
    ">🚚</div>
  `;
  return new L.DivIcon({
    html,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function MapMarkers({ vehicles, onSelect }: { vehicles: any[]; onSelect: (v: any) => void; }) {
  const map = useMap();
  return (
    <>
      {vehicles.map((v) => (
        <Marker
          key={v.id}
          position={v.route[v.routeIndex]}
          icon={createTruckIcon(v.progress)}
          eventHandlers={{
            click: () => {
              map.flyTo(v.route[v.routeIndex], 15, { animate: true });
              onSelect(v);
            },
          }}
        >
          <Popup>
            <strong>{v.id}</strong>
            <br />
            ปลายทาง: {v.destination}
            <br />
            ลูกค้า: {v.customer}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function FleetMap({ vehicles, selected, onSelect }: { vehicles: any[], selected: any, onSelect: (v: any) => void }) {
  return (
    <MapContainer
      center={[13.7367, 100.5232]}
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {selected && (
        <Polyline
          positions={selected.route}
          pathOptions={{ color: "green", weight: 4 }}
        />
      )}
      <MapMarkers vehicles={vehicles} onSelect={onSelect} />
    </MapContainer>
  );
}
