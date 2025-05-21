"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function ZoomControlPositionFix() {
  const map = useMap();
  useEffect(() => {
    const zoomControl = map.zoomControl;
    zoomControl.setPosition("bottomleft");
  }, [map]);
  return null;
}

export function MapZoomListener({ setZoomLevel }: { setZoomLevel: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const onZoom = () => {
      setZoomLevel(map.getZoom());
    };
    map.on("zoomend", onZoom);
    setZoomLevel(map.getZoom());
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map, setZoomLevel]);
  return null;
}
