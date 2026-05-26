"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "@/lib/googleMaps";

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({
  lat,
  lng,
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;

    loadGoogleMaps().then(() => {
      if (!mounted || !mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 8,
        disableDefaultUI: false,
      });

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
      });

      marker.addListener("dragend", (e: any) => {
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      });

      map.addListener("click", (e: any) => {
        marker.setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      });

      markerRef.current = marker;
    });

    return () => {
      mounted = false;
    };
  }, []);

  return <div ref={mapRef} className="w-full h-80 rounded-lg shadow-md" />;
};

export default MapPicker;
