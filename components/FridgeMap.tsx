'use client'

import { useEffect, useRef, useState } from 'react'
import { FridgeWithStatus, ExternalPlaceWithSource } from '@/lib/types'
import { createClient } from '@supabase/supabase-js'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface FridgeMapProps {
  fridges: FridgeWithStatus[]
  showImportsToggle?: boolean
}

// Status color mapping - Wefrigerator Brand Colors
const statusColors = {
  open: '#3AD29F',     // Fresh Green
  stocked: '#2EA7F2',  // Fridge Blue
  needs: '#FFB020',    // Warm Amber
  closed: '#0A1B2A',   // Deep Navy (with opacity)
}

// Source colors for imported places
const sourceColors = {
  osm_overpass: '#3B82F6', // blue
  lac_charitable_food: '#10B981', // green
  freedge: '#A855F7', // purple
}

export function FridgeMap({ fridges, showImportsToggle = false }: FridgeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [showImports, setShowImports] = useState(false)
  const [importedPlaces, setImportedPlaces] = useState<ExternalPlaceWithSource[]>([])

  // Fetch imported places when toggle is enabled
  useEffect(() => {
    if (!showImportsToggle || !showImports) return

    const fetchImports = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) return

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Get external places not linked to any fridge
      const { data } = await supabase
        .from('external_place')
        .select('*, source:external_source(*)')
        .eq('ignored', false)
        .not('lat', 'is', null)
        .not('lng', 'is', null)

      if (data) {
        // Filter out places that are already linked to fridges
        const linkedIds = new Set(
          fridges.map((f) => f.external_place_id).filter(Boolean)
        )
        const unlinked = data.filter((p) => !linkedIds.has(p.id))
        setImportedPlaces(unlinked as ExternalPlaceWithSource[])
      }
    }

    fetchImports()
  }, [showImports, showImportsToggle, fridges])

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

      // Add markers for verified fridges
      fridges.forEach((fridge) => {
        const status = fridge.latest_status?.status || 'open'
        const color = statusColors[status as keyof typeof statusColors]

        // Create custom colored marker (solid)
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

      // Add markers for imported places (if enabled)
      if (showImports && importedPlaces.length > 0) {
        importedPlaces.forEach((place) => {
          if (!place.lat || !place.lng) return

          const sourceName = place.source?.name || 'unknown'
          const color = sourceColors[sourceName as keyof typeof sourceColors] || '#6B7280'

          // Create outline marker for unverified imports
          const icon = L.divIcon({
            className: 'custom-marker-import',
            html: `
              <div style="
                width: 28px;
                height: 28px;
                background-color: white;
                border: 3px solid ${color};
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.85;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background-color: ${color};
                  border-radius: 50%;
                "></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })

          const marker = L.marker([place.lat, place.lng], { icon }).addTo(map)

          const sourceBadge =
            sourceName === 'osm_overpass'
              ? 'OSM'
              : sourceName === 'lac_charitable_food'
                ? 'LA County'
                : sourceName === 'freedge'
                  ? 'Freedge'
                  : 'External'

          const popupContent = `
            <div style="min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <h3 style="font-weight: 600; margin: 0;">${place.name || 'Imported Location'}</h3>
                <span style="
                  background-color: ${color};
                  color: white;
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 500;
                ">${sourceBadge}</span>
              </div>
              <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
                ${place.address || 'No address provided'}
              </p>
              <p style="font-size: 12px; color: #999; margin-bottom: 8px;">
                ⚠️ Unverified location from external source
              </p>
              <a 
                href="/admin/imports"
                style="
                  display: inline-block;
                  padding: 6px 12px;
                  background-color: ${color};
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 14px;
                  margin-top: 4px;
                "
              >
                Review in Admin
              </a>
            </div>
          `

          marker.bindPopup(popupContent)
        })
      }

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
  }, [fridges, showImports, importedPlaces])

  return (
    <div className="space-y-4">
      {showImportsToggle && (
        <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
          <Checkbox
            id="show-imports"
            checked={showImports}
            onCheckedChange={(checked) => setShowImports(checked === true)}
          />
          <Label
            htmlFor="show-imports"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Show unverified imports from external sources
          </Label>
          {showImports && importedPlaces.length > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              ({importedPlaces.length} locations)
            </span>
          )}
        </div>
      )}
      <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden border" />
    </div>
  )
}

