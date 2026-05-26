"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "@/lib/i18n";
import MapLoader from "./MapLoader";
import { loadGoogleMaps } from "@/lib/googleMaps";

const FILTER_MAP: Record<string, string[]> = {
  ទាំងអស់: [
    "Farm",
    "NGO",
    "Store/Market",
    "Education Center",
    "Processing Facility",
  ],
  អង្គការ: ["NGO"],
  ហាង: ["Store/Market"],
  កសិដ្ឋាន: ["Farm"],
  មជ្ឈមណ្ឌលអប់រំ: ["Education Center"],
  សម្ភារៈ: ["Processing Facility"],
};

const FILTER_MAP_EN: Record<string, string[]> = {
  All: [
    "Farm",
    "NGO",
    "Store/Market",
    "Education Center",
    "Processing Facility",
  ],
  Organization: ["NGO"],
  Shop: ["Store/Market"],
  Farm: ["Farm"],
  "Education Center": ["Education Center"],
  Equipment: ["Processing Facility"],
};

declare global {
  interface Window {
    google: any;
  }
}

interface MapProps {
  className?: string;
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstance: React.MutableRefObject<any>;
  markersRef: React.MutableRefObject<any[]>;
  userMarkerRef: React.MutableRefObject<any>;
  selectedRemarks: string[];
  setSelectedMarker: (marker: any) => void;
  setMapLoading: (loading: boolean) => void;
  mapLoading: boolean;
  selectedFilters: string[];
  searchTerm: string;
  farmData?: any[];
}

const Map: React.FC<MapProps> = ({
  className,
  mapRef,
  mapInstance,
  markersRef,
  userMarkerRef,
  selectedRemarks,
  setSelectedMarker,
  setMapLoading,
  mapLoading,
  selectedFilters,
  searchTerm,
}) => {
  const [farms, setFarms] = useState<any[]>([]);
  const { lang } = useTranslations();

  const fetchFarms = async () => {
    setMapLoading(true);
    const { data, error } = await supabase
      .from("farm_data")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching farm data:", error.message);
    } else {
      console.log("Fetched farms:", data);
      setFarms(data || []);
    }
    setMapLoading(false);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;

    loadGoogleMaps().then(() => {
      if (!mounted || !mapRef.current) return;

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.5657, lng: 104.991 },
        zoom: 7,
        disableDefaultUI: true,
      });

      fetchFarms();
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      !mapInstance.current ||
      !(mapInstance.current instanceof window.google?.maps?.Map) ||
      farms.length === 0
    )
      return;

    console.log("=== MAP FILTERING DEBUG ===");
    console.log("Farms:", farms);
    console.log("Selected Filters:", selectedFilters);
    console.log("Selected Remarks (English):", selectedRemarks);
    console.log("Search Term:", searchTerm);
    console.log("Current Language:", lang);

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const currentFilterMap = lang === "kh" ? FILTER_MAP : FILTER_MAP_EN;
    const allKey = lang === "kh" ? "ទាំងអស់" : "All";

    const getEnglishRemarksFromFilters = (filters: string[]): string[] => {
      if (filters.includes(allKey)) {
        return currentFilterMap[allKey];
      }
      return filters.flatMap((filter) => currentFilterMap[filter] || []);
    };

    const englishRemarksFromFilters =
      getEnglishRemarksFromFilters(selectedFilters);

    console.log("English remarks from filters:", englishRemarksFromFilters);

    let activeFilters: string[] = [];

    if (selectedFilters.length > 0) {
      activeFilters = englishRemarksFromFilters;
      console.log("Using filter system:", activeFilters);
    } else if (selectedRemarks.length > 0) {
      activeFilters = selectedRemarks;
      console.log("Using English remark system:", activeFilters);
    } else {
      activeFilters = currentFilterMap[allKey];
      console.log("No filters selected - showing ALL farms");
    }

    console.log("Final active filters:", activeFilters);

    const filteredFarms = farms.filter((farm) => {
      const farmType = farm.type;

      const matchesType = activeFilters.includes(farmType);

      const matchesSearch =
        !searchTerm ||
        farm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.address?.toLowerCase().includes(searchTerm.toLowerCase());

      console.log(
        `Farm: ${farm.name}, Type: ${farmType}, matchesType: ${matchesType}, matchesSearch: ${matchesSearch}`
      );

      return matchesType && matchesSearch;
    });

    console.log("Filtered Farms:", filteredFarms);

    markersRef.current = filteredFarms.map((farm) => {
      const marker = new window.google.maps.Marker({
        position: { lat: farm.lat, lng: farm.lng },
        map: mapInstance.current,
        title: farm.name,
        icon: {
          url: getMarkerIcon(farm.type),
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      marker.addListener("click", () => {
        const markerData = {
          ...farm,
          position: { lat: farm.lat, lng: farm.lng },
          lat: farm.lat,
          lng: farm.lng,
        };
        setSelectedMarker(markerData);
      });
      return marker;
    });
  }, [farms, selectedRemarks, searchTerm, selectedFilters, lang]);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "Farm":
        return "/icons/farmmap/location_farm.svg";
      case "Store/Market":
        return "/icons/farmmap/location_store.svg";
      case "NGO":
        return "/icons/farmmap/location_ngo.svg";
      case "Education Center":
        return "/icons/farmmap/location_education.svg";
      case "Processing Facility":
        return "/icons/farmmap/location_processing.svg";
      default:
        return "/icons/farmmap/google_pin.svg";
    }
  };

  return (
    <>
      <MapLoader loading={mapLoading} />
      <div ref={mapRef} className={`w-full flex-1 ${className || ""}`} />
    </>
  );
};

export default Map;
