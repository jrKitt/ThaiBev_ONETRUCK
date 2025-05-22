'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  mapCenter: [number, number];
  zoomLevel: number;
}

const MapController: React.FC<MapControllerProps> = ({ mapCenter, zoomLevel }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && map.setView && typeof map.setView === 'function') {
      map.setView(mapCenter, zoomLevel);
    }
  }, [map, mapCenter, zoomLevel]);
  
  return null;
};

export default MapController;