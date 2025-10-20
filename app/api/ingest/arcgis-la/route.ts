import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database, LASite, LAOrgCluster } from '@/lib/types'
import {
  cleanText,
  normalizeAddress,
  normalizePhones,
  normalizeHours,
  normalizeUrl,
  parseDateUpdated,
} from '@/lib/utils/la-normalization'
import {
  extractOrgRootName,
  classifySiteType,
  extractServiceTags,
  extractPopulationTags,
  determineAccessModel,
  classifyOrgType,
  calculateFreshnessBucket,
} from '@/lib/utils/la-classification'
import { deduplicateSites, clusterByOrg } from '@/lib/utils/la-clustering'
import {
  computeRecencyScore,
  computeOpenNowScore,
  computeSpecificityScore,
  computePopulationFitScore,
  generateQualityFlags,
} from '@/lib/utils/la-scoring'

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

    // Get the LA County source
    const { data: sourceData, error: sourceError } = (await supabase
      .from('external_source')
      .select('id')
      .eq('name', 'lac_charitable_food')
      .single()) as { data: { id: string } | null; error: unknown }

    if (sourceError || !sourceData) {
      throw new Error('LA County source not found in database')
    }

    const sourceId = sourceData.id

    // LA County ArcGIS REST API endpoint
    const arcgisUrl =
      'https://arcgis.gis.lacounty.gov/arcgis/rest/services/LACounty_Dynamic/LMS_Data_Public_2014/MapServer/156/query?where=1%3D1&outFields=*&f=geojson'

    // Fetch data
    const response = await fetch(arcgisUrl)

    if (!response.ok) {
      throw new Error(`ArcGIS API failed: ${response.statusText}`)
    }

    const geojson = await response.json()
    const features = geojson.features || []

    // Transform features to LASite records
    const sites: LASite[] = features
      .map((feature: Record<string, unknown>) => {
        const coordinates = (feature.geometry as Record<string, unknown>)?.coordinates as number[] | undefined
        if (!coordinates || coordinates.length < 2) return null

        const [lon, lat] = coordinates

        if (!lat || !lon) return null

        const props = (feature.properties as Record<string, unknown>) || {}

        // Normalize basic fields
        const name = cleanText(props.Name as string) || 'Food Distribution Site'
        const description = cleanText(props.description as string)
        const email = cleanText(props.email as string)
        const source = cleanText(props.source as string) || '211'
        const postId = props.post_id ? parseInt(String(props.post_id)) : null

        // Normalize address
        const address = normalizeAddress(props)

        // Normalize phones
        const phones = normalizePhones(props.phones as string)

        // Normalize hours
        const hours = normalizeHours(props.hours as string)

        // Normalize URL and extract domain
        const { url: website, domain: websiteDomain } = normalizeUrl(props.url as string)

        // Parse date updated
        const updatedAt = parseDateUpdated(props.date_updated as number)

        // Derive classification fields
        const orgRootName = extractOrgRootName(name, props.org_name as string, websiteDomain)
        const siteType = classifySiteType(
          description,
          props.cat1 as string,
          props.cat2 as string,
          props.cat3 as string,
          name
        )
        const serviceTags = extractServiceTags(
          description,
          props.cat1 as string,
          props.cat2 as string,
          props.cat3 as string
        )
        const populationTags = extractPopulationTags(description, props.hours as string)
        const accessModel = determineAccessModel(props.hours as string, description)
        const orgType = classifyOrgType(name, props.org_name as string, description)
        const freshnessBucket = calculateFreshnessBucket(updatedAt)

        // Compute ranking scores
        const scoreRecency = computeRecencyScore(freshnessBucket)
        const scoreOpenNow = computeOpenNowScore()
        const scoreSpecificity = computeSpecificityScore(siteType, serviceTags)
        const scorePopulationFit = computePopulationFitScore()

        // Generate quality flags
        const flags = generateQualityFlags(lat, lon, hours, website, freshnessBucket, phones)

        // Build site ID
        const objectId = props.OBJECTID || props.ObjectId || Math.random().toString()
        const siteId = `lac-156:OBJECTID-${objectId}`

        const site: LASite = {
          site_id: siteId,
          post_id: postId,
          name,
          org_root_name: orgRootName,
          org_type: orgType,
          site_type: siteType,
          service_tags: serviceTags,
          population_tags: populationTags,
          access_model: accessModel,
          description,
          address,
          location: { lat, lon },
          hours,
          phones,
          website,
          website_domain: websiteDomain,
          email,
          source,
          updated_at: updatedAt,
          freshness_bucket: freshnessBucket,
          distance_m: null,
          score_recency: scoreRecency,
          score_open_now: scoreOpenNow,
          score_specificity: scoreSpecificity,
          score_population_fit: scorePopulationFit,
          flags,
          raw: {
            OBJECTID: (props.OBJECTID || props.ObjectId) as number,
            link: props.link as string | null,
            ...props,
          },
        }

        return site
      })
      .filter((site: LASite | null): site is LASite => site !== null)

    // Deduplicate sites
    const uniqueSites = deduplicateSites(sites)

    // Cluster sites by organization
    const orgClusters: LAOrgCluster[] = clusterByOrg(uniqueSites)

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = (await (supabase as any)
        .from('external_place')
        .upsert(placesForDb, {
          onConflict: 'source_id,source_place_id',
        })) as { error: unknown }

      if (upsertError) {
        throw new Error(`Database upsert failed: ${(upsertError as { message: string }).message}`)
      }

      upsertedCount = placesForDb.length
    }

    return NextResponse.json({
      success: true,
      source: 'lac_charitable_food',
      upserted: upsertedCount,
      total_features: features.length,
      sites: uniqueSites,
      org_clusters: orgClusters,
    })
  } catch (error) {
    console.error('ArcGIS LA ingestion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
