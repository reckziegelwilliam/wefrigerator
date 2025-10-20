'use client'

import { useEffect, useRef } from 'react'
import { FridgeWithStatus } from '@/lib/types'

interface FridgeMapProps {
  fridges: FridgeWithStatus[]
}

// Status color mapping - Wefrigerator Brand Colors
const statusColors = {
  open: '#3AD29F',     // Fresh Green
  stocked: '#2EA7F2',  // Fridge Blue
  needs: '#FFB020',    // Warm Amber
  closed: '#0A1B2A',   // Deep Navy (with opacity)
}

export function FridgeMap({ fridges }: FridgeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const loadMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current) return

      const L = (await import('leaflet')).default
      // Import leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
      }

      // Fix for default marker icons in webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Calculate center and bounds
      const bounds = fridges.map(f => [f.lat, f.lng] as [number, number])
      const center = bounds.length > 0
        ? bounds.reduce(
            (acc, coord) => [acc[0] + coord[0] / bounds.length, acc[1] + coord[1] / bounds.length],
            [0, 0]
          )
        : [37.7749, -122.4194] // Default to SF

      // Create map
      const map = L.map(mapRef.current).setView(center as [number, number], 12)
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add markers for each fridge
      fridges.forEach((fridge) => {
        const status = fridge.latest_status?.status || 'open'
        const color = statusColors[status as keyof typeof statusColors]

        // Create custom colored marker
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 12px;
                height: 12px;
                background-color: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([fridge.lat, fridge.lng], { icon }).addTo(map)

        // Create popup
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 8px;">${fridge.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
              ${fridge.address || 'No address provided'}
            </p>
            ${fridge.latest_status?.note ? `
              <p style="font-size: 13px; margin-bottom: 8px;">
                ${fridge.latest_status.note}
              </p>
            ` : ''}
            <a 
              href="/fridge/${fridge.id}"
              style="
                display: inline-block;
                padding: 6px 12px;
                background-color: ${color};
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-size: 14px;
                margin-top: 8px;
              "
            >
              View Details
            </a>
          </div>
        `

        marker.bindPopup(popupContent)
      })

      // Fit bounds if we have fridges
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [fridges])

  return <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden border" />
}

