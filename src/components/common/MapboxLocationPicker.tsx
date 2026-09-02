import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, MapPin, Loader2, Navigation, AlertTriangle, Crosshair } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapboxSearchResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [longitude, latitude]
}

interface MapboxLocationPickerProps {
  location: string;
  onLocationChange: (newLocation: string) => void;
  latitude: number | "";
  longitude: number | "";
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  location,
  onLocationChange,
  latitude,
  longitude,
  onCoordinatesChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Search & Geolocation State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapboxSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  // Default fallback center (e.g. Mumbai [lng, lat])
  const defaultLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : 72.8236;
  const defaultLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : 18.9432;

  // Perform Mapbox Reverse Geocoding for a given [lng, lat]
  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      if (res.status === 401) {
        setTokenError(true);
        return;
      }
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        onLocationChange(data.features[0].place_name);
      }
    } catch (err) {
      console.warn("[Mapbox] Reverse geocoding failed:", err);
    }
  };

  // Handle Geolocation Request for User's Current GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onCoordinatesChange(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        }
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
        }

        reverseGeocode(lng, lat);
        setIsLocating(false);
      },
      (err) => {
        console.warn("[Geolocation] Error getting position:", err);
        alert("Unable to retrieve your position. Please grant location permissions in your browser.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [defaultLng, defaultLat],
        zoom: typeof latitude === "number" ? 14 : 11,
      });

      map.on("load", () => {
        map.resize();

        // Auto-detect user current location if no initial coordinates are passed
        if ((latitude === "" || longitude === "") && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude: lat, longitude: lng } = pos.coords;
              onCoordinatesChange(lat, lng);
              if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
              if (mapRef.current) mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
              reverseGeocode(lng, lat);
            },
            () => {
              // Silently fallback to default center if permission denied
            },
            { timeout: 5000 }
          );
        }
      });

      map.on("error", (e) => {
        if (e.error && (e.error as any).status === 401) {
          setTokenError(true);
        }
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Create Draggable Mapbox Marker
      const marker = new mapboxgl.Marker({
        draggable: true,
        color: "#4f46e5", // Indigo theme color
      })
        .setLngLat([defaultLng, defaultLat])
        .addTo(map);

      // Handle Marker Drag End
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        onCoordinatesChange(lngLat.lat, lngLat.lng);
        reverseGeocode(lngLat.lng, lngLat.lat);
      });

      // Handle Map Click
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]);
        onCoordinatesChange(lat, lng);
        reverseGeocode(lng, lat);
      });

      mapRef.current = map;
      markerRef.current = marker;

      // Trigger map resize shortly after mount for modal visibility
      const resizeTimer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 150);

      // ResizeObserver to handle dynamic modal container sizing
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        clearTimeout(resizeTimer);
        resizeObserver.disconnect();
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markerRef.current = null;
        }
      };
    }
  }, []);

  // Update Marker & Map Center when coordinates change externally (e.g. edit mode preloading)
  useEffect(() => {
    if (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      }
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
      }
    }
  }, [latitude, longitude]);

  // Debounced Mapbox Geocoding Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery.trim()
          )}.json?access_token=${MAPBOX_TOKEN}&limit=5`
        );
        if (res.status === 401) {
          setTokenError(true);
          setIsSearching(false);
          return;
        }
        const data = await res.json();
        setSearchResults(data.features || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("[Mapbox] Search geocoding error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Search Result Selection
  const handleSelectResult = (result: MapboxSearchResult) => {
    const [lng, lat] = result.center;

    onLocationChange(result.place_name);
    onCoordinatesChange(lat, lng);

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    }

    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="space-y-3">
      {tokenError && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-md text-xs flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Mapbox Access Token Issue Detected</p>
            <p className="text-amber-800 mt-0.5">
              Mapbox returned <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">401 Unauthorized</code> for the current token. Please set a valid Mapbox public token starting with <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">pk.</code> in <code className="font-mono font-bold">.env</code> (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_MAPBOX_ACCESS_TOKEN</code>) and restart the dev server.
            </p>
          </div>
        </div>
      )}

      {/* 1. Location Search Input + Geolocation Button */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="mapbox-search" className="block text-sm font-medium text-gray-700">
            Search Location on Map
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-md border border-indigo-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
            ) : (
              <Crosshair className="h-3.5 w-3.5 text-indigo-600" />
            )}
            <span>Use Current Location</span>
          </button>
        </div>
        <div className="relative">
          <input
            id="mapbox-search"
            type="text"
            placeholder="e.g. Marine Drive Mumbai, Rajwada Indore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="w-full pl-9 pr-8 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-indigo-600" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
            {searchResults.map((res) => (
              <div
                key={res.id}
                onClick={() => handleSelectResult(res)}
                className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer flex items-start gap-2 text-gray-800 transition"
              >
                <MapPin className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{res.text}</p>
                  <p className="text-gray-500 line-clamp-1">{res.place_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Mapbox Container */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <Navigation className="h-3.5 w-3.5 text-indigo-600" /> Mapbox Location Pin Selector
          </span>
          <span>Click map or drag pin to adjust location</span>
        </div>
        <div
          ref={mapContainerRef}
          className="h-64 sm:h-72 w-full min-h-[250px] rounded-lg border border-gray-300 shadow-inner overflow-hidden relative"
        />
      </div>

      {/* 3. Address / Location Input Field */}
      <div>
        <label htmlFor="mapbox-location-address" className="block text-sm font-medium text-gray-700 mb-1">
          Location Address
        </label>
        <div className="relative">
          <input
            id="mapbox-location-address"
            type="text"
            required
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Selected address will appear here..."
            className="w-full pl-9 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
          />
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
        </div>
      </div>

      {/* 4. Read-Only Derived Coordinates Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-md border border-slate-200 text-xs">
        <div>
          <label className="block text-slate-500 font-medium mb-1">Derived Latitude</label>
          <input
            type="text"
            readOnly
            value={typeof latitude === "number" ? latitude.toFixed(6) : "Pin location to derive"}
            className="w-full px-2.5 py-1.5 bg-white border rounded font-mono text-slate-800 font-bold cursor-not-allowed text-xs"
          />
        </div>
        <div>
          <label className="block text-slate-500 font-medium mb-1">Derived Longitude</label>
          <input
            type="text"
            readOnly
            value={typeof longitude === "number" ? longitude.toFixed(6) : "Pin location to derive"}
            className="w-full px-2.5 py-1.5 bg-white border rounded font-mono text-slate-800 font-bold cursor-not-allowed text-xs"
          />
        </div>
      </div>
    </div>
  );
};
