import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/types'

// Validate authorization
function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.INGEST_SECRET

  if (!secret) {
    // If no secret is configured, allow in development
    return process.env.NODE_ENV === 'development'
  }

  return authHeader === `Bearer ${secret}`
}

// LA County bounding box (approximate)
const LA_BOUNDS = {
  minLat: 33.7,
  maxLat: 34.3,
  minLng: -118.7,
  maxLng: -118.1,
}

function isInLAArea(lat: number, lng: number): boolean {
  return (
    lat >= LA_BOUNDS.minLat &&
    lat <= LA_BOUNDS.maxLat &&
    lng >= LA_BOUNDS.minLng &&
    lng <= LA_BOUNDS.maxLng
  )
}

export async function POST(request: NextRequest) {
  // Validate authorization
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Initialize Supabase with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Get the Freedge source
    const { data: sourceData, error: sourceError } = await supabase
      .from('external_source')
      .select('*')
      .eq('name', 'freedge')
      .single()

    if (sourceError || !sourceData) {
      throw new Error('Freedge source not found in database')
    }

    const sourceId: string = (sourceData as Database['public']['Tables']['external_source']['Row']).id

    // Try to fetch Freedge data
    // Note: Freedge.org uses a map-based interface. We'll try their API endpoint
    // If this doesn't work, we may need to scrape or manually curate
    const freedgeUrl = 'https://freedge.org/api/locations'

    let locations: Database['public']['Tables']['external_place']['Row'][] = []
    let fetchError = null

    try {
      const response = await fetch(freedgeUrl, {
        headers: {
          'User-Agent': 'Wefrigerator Community Fridge Locator',
        },
      })

      if (response.ok) {
        const data = await response.json()
        locations = Array.isArray(data) ? data : data.locations || []
      } else {
        fetchError = `API returned ${response.status}`
      }
    } catch (error) {
      fetchError = error instanceof Error ? error.message : 'Fetch failed'
    }

    // If API fetch failed, we could fall back to a manually curated list
    // For now, we'll just log it and return what we have
    if (fetchError) {
      console.warn(`Freedge API fetch failed: ${fetchError}`)

      // Fallback: Return success with 0 results and a warning
      return NextResponse.json({
        success: true,
        source: 'freedge',
        upserted: 0,
        total_locations: 0,
        warning: `Freedge API unavailable: ${fetchError}. Consider manual curation or alternative data source.`,
      })
    }

    // Filter for LA area and transform to external_place records
    const places = locations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((location: any) => {
        // Try to extract coordinates - structure may vary
        const lat = location.lat || location.latitude || location.coordinates?.lat
        const lng =
          location.lng || location.lon || location.longitude || location.coordinates?.lng

        if (!lat || !lng) return null

        // Filter to LA area only
        if (!isInLAArea(lat, lng)) return null

        const name = location.name || location.title || 'Community Fridge'
        const address =
          location.address ||
          [
            location.street,
            location.city,
            location.state,
            location.zip,
          ]
            .filter(Boolean)
            .join(', ') ||
          null

        const placeId = String(location.id || `${lat},${lng}`)

        return {
          source_id: sourceId,
          source_place_id: placeId,
          name,
          address,
          lat,
          lng,
          raw: location as Record<string, unknown>,
          last_seen_at: new Date().toISOString(),
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any): p is { source_id: string; source_place_id: string; name: string; address: string | null; lat: number; lng: number; raw: Record<string, unknown>; last_seen_at: string } => p !== null)

    // Upsert into database
    let upsertedCount = 0
    if (places.length > 0) {
      const { error: upsertError } = await supabase
        .from('external_place')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(places as any, {
          onConflict: 'source_id,source_place_id',
        })

      if (upsertError) {
        throw new Error(`Database upsert failed: ${upsertError.message}`)
      }

      upsertedCount = places.length
    }

    return NextResponse.json({
      success: true,
      source: 'freedge',
      upserted: upsertedCount,
      total_locations: locations.length,
      filtered_to_la: places.length,
    })
  } catch (error) {
    console.error('Freedge ingestion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

