"use client"

import { useEffect, useRef } from "react"
import type { LocationData } from "@/hooks/use-signalr"

interface LocationMapProps {
  locations: LocationData[]
  currentLocation?: { lat: number; lon: number } | null
}

export default function LocationMap({ locations, currentLocation }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      if (typeof window === "undefined") return

      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (!mapInstanceRef.current && mapRef.current) {
        // Initialize map centered on Dhaka, Bangladesh
        mapInstanceRef.current = L.map(mapRef.current).setView([23.8103, 90.4125], 10)

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default

      // Clear existing markers
      markersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker)
      })
      markersRef.current = []

      // Add current location marker (blue)
      if (currentLocation) {
        const currentMarker = L.marker([currentLocation.lat, currentLocation.lon])
          .addTo(mapInstanceRef.current)
          .bindPopup(
            `<b>Your Location</b><br>Lat: ${currentLocation.lat.toFixed(6)}<br>Lon: ${currentLocation.lon.toFixed(6)}`,
          )

        markersRef.current.push(currentMarker)
      }

      // Add received location markers (red)
      locations.forEach((location, index) => {
        const marker = L.marker([location.lat, location.lon], {
          icon: L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(
            `<b>${location.userName}</b><br>Lat: ${location.lat.toFixed(6)}<br>Lon: ${location.lon.toFixed(6)}`,
          )

        markersRef.current.push(marker)
      })

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current)
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    }

    updateMarkers()
  }, [locations, currentLocation])

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg border" style={{ minHeight: "400px" }} />
      {locations.length === 0 && !currentLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-lg">
          <div className="text-center text-slate-500">
            <div className="text-lg mb-2">🗺️</div>
            <p>Map will show locations when available</p>
          </div>
        </div>
      )}
    </div>
  )
}
