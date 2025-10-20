import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database, LASite, OSMElement, OSMSourceMeta, LARawData } from '@/lib/types'
import {
  extractOSMCoordinates,
  extractOSMAddress,
  extractOSMPhones,
  extractOSMEmails,
  extractOSMWebsites,
  extractOSMImages,
  parseOpeningHours,
  computeRawHash,
} from '@/lib/utils/osm-normalization'
import {
  classifyOSMSiteType,
  extractOSMServiceTags,
  extractOSMPopulationTags,
  determineOSMAccessModel,
  classifyOSMOrgType,
  calculateOSMFreshnessBucket,
  extractOSMOrgRootName,
} from '@/lib/utils/osm-classification'
import { deduplicateSites, clusterByOrg } from '@/lib/utils/la-clustering'
import {
  computeRecencyScore,
  computeOpenNowScore,
  computeSpecificityScore,
  computePopulationFitScore,
  generateQualityFlags,
} from '@/lib/utils/la-scoring'
import { normalizeUrl } from '@/lib/utils/la-normalization'

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

    // Get the OSM Overpass source
    const { data: sourceData, error: sourceError } = await supabase
      .from('external_source')
      .select('*')
      .eq('name', 'osm_overpass')
      .single()

    if (sourceError || !sourceData) {
      throw new Error('OSM Overpass source not found in database')
    }

    const sourceId: string = (sourceData as { id: string }).id

    // Overpass query: amenity=food_sharing within Los Angeles area
    // Using out center meta to get centroid and version/timestamp info
    const overpassQuery = `[out:json][timeout:25];
area["name"="Los Angeles"]["admin_level"="8"]->.a;
(
  node["amenity"="food_sharing"](area.a);
  way["amenity"="food_sharing"](area.a);
  relation["amenity"="food_sharing"](area.a);
);
out center meta;`

    // Query Overpass API
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: overpassQuery,
    })

    if (!response.ok) {
      throw new Error(`Overpass API failed: ${response.statusText}`)
    }

    const json = await response.json()
    const elements: OSMElement[] = json.elements || []

    // Transform elements to LASite records
    const sites: LASite[] = elements
      .map((element) => {
        // Extract coordinates
        const location = extractOSMCoordinates(element)
        if (!location) return null

        const tags = element.tags || {}

        // Extract basic fields
        const name = tags.name || tags.operator || 'Community Fridge'
        const description = tags.description || tags.note || null
        const emails = extractOSMEmails(tags)
        const email = emails[0] || null

        // Normalize address
        const address = extractOSMAddress(tags)

        // Normalize phones
        const phones = extractOSMPhones(tags)

        // Normalize hours
        const hours = parseOpeningHours(tags.opening_hours)

        // Normalize websites
        const websites = extractOSMWebsites(tags)
        const website = websites[0] || null
        const { domain: websiteDomain } = normalizeUrl(website)

        // Parse images
        const images = extractOSMImages(tags)

        // Parse timestamp for freshness
        const updatedAt = element.timestamp || new Date().toISOString()

        // Derive classification fields
        const orgRootName = extractOSMOrgRootName(tags)
        const siteType = classifyOSMSiteType(tags)
        const serviceTags = extractOSMServiceTags(tags)
        const populationTags = extractOSMPopulationTags(tags)
        const accessModel = determineOSMAccessModel(tags, tags.opening_hours)
        const orgType = classifyOSMOrgType(tags)
        const freshnessBucket = calculateOSMFreshnessBucket(element.timestamp)

        // Compute ranking scores
        const scoreRecency = computeRecencyScore(freshnessBucket)
        const scoreOpenNow = computeOpenNowScore()
        const scoreSpecificity = computeSpecificityScore(siteType, serviceTags)
        const scorePopulationFit = computePopulationFitScore()

        // Generate quality flags
        const flags = generateQualityFlags(
          location.lat,
          location.lon,
          hours,
          website,
          freshnessBucket,
          phones
        )

        // Build site ID
        const siteId = `osm-${element.type}:${element.id}`

        // Build OSM source metadata
        const sourceMeta: OSMSourceMeta = {
          provider: 'OpenStreetMap',
          endpoint: 'Overpass API',
          endpoint_query: overpassQuery,
          osm_type: element.type,
          osm_id: element.id,
          osm_version: element.version,
          osm_timestamp: element.timestamp,
          last_seen_at: new Date().toISOString(),
          raw_hash: computeRawHash(tags, location.lat, location.lon),
        }

        const site: LASite = {
          site_id: siteId,
          post_id: null,
          name,
          org_root_name: orgRootName,
          org_type: orgType,
          site_type: siteType,
          service_tags: serviceTags,
          population_tags: populationTags,
          access_model: accessModel,
          description,
          address,
          location,
          hours,
          phones,
          website,
          website_domain: websiteDomain,
          email,
          source: 'osm_overpass',
          updated_at: updatedAt,
          freshness_bucket: freshnessBucket,
          distance_m: null,
          score_recency: scoreRecency,
          score_open_now: scoreOpenNow,
          score_specificity: scoreSpecificity,
          score_population_fit: scorePopulationFit,
          flags,
          raw: {
            OBJECTID: element.id,
            osm_element: element,
            source_meta: sourceMeta,
            images,
            websites,
            emails,
          } as LARawData,
        }

        return site
      })
      .filter((site): site is LASite => site !== null)

    // Deduplicate sites (use 75m threshold for community fridges)
    const uniqueSites = deduplicateSites(sites, 75)

    // Cluster sites by organization
    const orgClusters = clusterByOrg(uniqueSites)

    // Prepare records for database insertion
    const placesForDb = uniqueSites.map((site) => ({
      source_id: sourceId,
      source_place_id: site.site_id,
      name: site.name,
      address: [
        site.address.street1,
        site.address.street2,
        site.address.city,
        site.address.state,
        site.address.zip,
      ]
        .filter(Boolean)
        .join(', '),
      lat: site.location.lat,
      lng: site.location.lon,
      raw: site as unknown as Record<string, unknown>,
      last_seen_at: new Date().toISOString(),
    }))

    // Upsert into database
    let upsertedCount = 0
    if (placesForDb.length > 0) {
      const { error: upsertError } = await supabase
        .from('external_place')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(placesForDb as any, {
          onConflict: 'source_id,source_place_id',
        })

      if (upsertError) {
        throw new Error(`Database upsert failed: ${upsertError.message}`)
      }

      upsertedCount = placesForDb.length
    }

    return NextResponse.json({
      success: true,
      source: 'osm_overpass',
      upserted: upsertedCount,
      total_elements: elements.length,
      sites: uniqueSites,
      org_clusters: orgClusters,
    })
  } catch (error) {
    console.error('Overpass ingestion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
