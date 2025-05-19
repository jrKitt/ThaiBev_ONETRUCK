// components/AnimatedMarker.jsx
"use client";

import { useEffect, useRef } from "react";
import { Marker, useMap } from "react-leaflet";

export default function AnimatedMarker({ position, icon }) {
  const markerRef = useRef(null);
  // เก็บตำแหน่งก่อนหน้าเป็น ref เพื่อเริ่ม animation จากจุดนั้น
  const prevPosRef = useRef(position);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const from = prevPosRef.current;
    const to = position;
    const duration = 1000; // ms ปรับได้ตามต้องการ
    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1); 
      const lat = from[0] + (to[0] - from[0]) * t;
      const lng = from[1] + (to[1] - from[1]) * t;
      marker.setLatLng([lat, lng]);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        prevPosRef.current = to;
      }
    }

    requestAnimationFrame(animate);
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={prevPosRef.current}
      icon={icon}
    />
  );
}
