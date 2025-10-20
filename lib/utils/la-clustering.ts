import { LASite, LAOrgCluster, LAClusteredSite } from '@/lib/types'
import { haversineMeters, stringSimilarity } from './geo'

/**
 * Create a normalized address key for deduplication
 */
export function normalizeAddressKey(
  street1: string | null,
  city: string | null,
  state: string | null,
  zip: string | null
): string {
  const parts = [street1, city, state, zip]
    .filter(Boolean)
    .map((p) => p!.toLowerCase().trim().replace(/\s+/g, ' '))

  return parts.join('|')
}

/**
 * Check if two sites are the same location
 * @param proximityThresholdM Proximity threshold in meters (default 125m for LMS, 75m for fridges)
 */
export function isSameSite(
  siteA: LASite,
  siteB: LASite,
  proximityThresholdM: number = 125
): boolean {
  const keyA = normalizeAddressKey(
    siteA.address.street1,
    siteA.address.city,
    siteA.address.state,
    siteA.address.zip
  )
  const keyB = normalizeAddressKey(
    siteB.address.street1,
    siteB.address.city,
    siteB.address.state,
    siteB.address.zip
  )

  const sameAddress = keyA === keyB && keyA !== ''
  const distance = haversineMeters(
    { lat: siteA.location.lat, lng: siteA.location.lon },
    { lat: siteB.location.lat, lng: siteB.location.lon }
  )

  return sameAddress && distance < proximityThresholdM
}

/**
 * Check if two sites are probable duplicates
 * @param proximityThresholdM Proximity threshold in meters for name similarity check
 */
export function isProbableDuplicate(
  siteA: LASite,
  siteB: LASite,
  proximityThresholdM: number = 125
): boolean {
  const distance = haversineMeters(
    { lat: siteA.location.lat, lng: siteA.location.lon },
    { lat: siteB.location.lat, lng: siteB.location.lon }
  )

  // Check fuzzy name match + proximity
  const nameSimilarity = stringSimilarity(siteA.name, siteB.name)
  
  if (nameSimilarity >= 0.92 && distance <= proximityThresholdM) {
    return true
  }

  // Check phone overlap + proximity
  const phoneOverlap = countPhoneOverlap(siteA.phones, siteB.phones)
  if (phoneOverlap >= 1 && distance <= proximityThresholdM) {
    return true
  }

  // Check same phone set + city
  const sameCity =
    siteA.address.city &&
    siteB.address.city &&
    siteA.address.city.toLowerCase() === siteB.address.city.toLowerCase()

  if (sameCity && phoneOverlap >= 1) {
    const phoneSetA = new Set(siteA.phones.map((p) => normalizePhoneNumber(p.number)))
    const phoneSetB = new Set(siteB.phones.map((p) => normalizePhoneNumber(p.number)))

    if (phoneSetA.size > 0 && areSetsEqual(phoneSetA, phoneSetB)) {
      return true
    }
  }

  return false
}

/**
 * Count how many phone numbers overlap between two sites
 */
function countPhoneOverlap(
  phonesA: { number: string }[],
  phonesB: { number: string }[]
): number {
  const setA = new Set(phonesA.map((p) => normalizePhoneNumber(p.number)))
  const setB = new Set(phonesB.map((p) => normalizePhoneNumber(p.number)))

  let overlap = 0
  setA.forEach((phone) => {
    if (setB.has(phone)) overlap++
  })

  return overlap
}

/**
 * Normalize phone number to digits only for comparison
 */
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Check if two sets are equal
 */
function areSetsEqual<T>(setA: Set<T>, setB: Set<T>): boolean {
  if (setA.size !== setB.size) return false
  for (const item of setA) {
    if (!setB.has(item)) return false
  }
  return true
}

/**
 * Cluster sites by parent organization
 */
export function clusterByOrg(sites: LASite[]): LAOrgCluster[] {
  // Group sites by org_root_name + website_domain
  const orgMap = new Map<string, LASite[]>()

  for (const site of sites) {
    const orgKey = [site.org_root_name || 'unknown', site.website_domain || 'unknown'].join('::')

    if (!orgMap.has(orgKey)) {
      orgMap.set(orgKey, [])
    }
    orgMap.get(orgKey)!.push(site)
  }

  // Build org clusters
  const clusters: LAOrgCluster[] = []

  for (const [orgKey, orgSites] of orgMap.entries()) {
    // Skip single-site orgs with unknown names
    if (orgSites.length === 1 && orgKey.startsWith('unknown::')) {
      continue
    }

    // Get org-level data from first site
    const firstSite = orgSites[0]

    const clusteredSites: LAClusteredSite[] = orgSites.map((site) => ({
      site_id: site.site_id,
      name: site.name,
      site_type: site.site_type,
      address: site.address,
      location: site.location,
      service_tags: site.service_tags,
      population_tags: site.population_tags,
    }))

    const cluster: LAOrgCluster = {
      org_root_name: firstSite.org_root_name || 'Unknown Organization',
      org_type: firstSite.org_type,
      website: firstSite.website,
      website_domain: firstSite.website_domain,
      sites: clusteredSites,
    }

    clusters.push(cluster)
  }

  // Sort clusters by number of sites (descending) then by name
  clusters.sort((a, b) => {
    if (a.sites.length !== b.sites.length) {
      return b.sites.length - a.sites.length
    }
    return a.org_root_name.localeCompare(b.org_root_name)
  })

  return clusters
}

/**
 * Merge two sites from different sources, preferring the most precise data
 */
export function crossSourceMerge(siteA: LASite, siteB: LASite): LASite {
  // Determine which site has better coordinates
  // Prefer OSM (source starts with 'osm') for community fridges
  const sourceA = siteA.source.toLowerCase()
  const sourceB = siteB.source.toLowerCase()
  
  const isAOSM = sourceA.includes('osm')
  const isBOSM = sourceB.includes('osm')
  const isACommunityFridge = siteA.site_type === 'community_fridge'
  const isBCommunityFridge = siteB.site_type === 'community_fridge'

  // Prefer OSM coordinates for community fridges
  let preferredLocation = siteA.location
  let preferredAddress = siteA.address
  
  if ((isACommunityFridge || isBCommunityFridge) && isBOSM && !isAOSM) {
    preferredLocation = siteB.location
    if (siteB.address.street1) {
      preferredAddress = siteB.address
    }
  }

  // Check for significant geo mismatch
  const distance = haversineMeters(
    { lat: siteA.location.lat, lng: siteA.location.lon },
    { lat: siteB.location.lat, lng: siteB.location.lon }
  )
  const hasGeoMismatch = distance > 150

  // Merge websites (union unique)
  const websites = [siteA.website, siteB.website].filter(Boolean)
  const uniqueWebsites = Array.from(new Set(websites))
  const mergedWebsite = uniqueWebsites[0] || null

  // Merge phones (union unique by normalized number)
  const phoneMap = new Map<string, typeof siteA.phones[0]>()
  for (const phone of [...siteA.phones, ...siteB.phones]) {
    const normalized = normalizePhoneNumber(phone.number)
    if (!phoneMap.has(normalized)) {
      phoneMap.set(normalized, phone)
    }
  }
  const mergedPhones = Array.from(phoneMap.values())

  // Merge hours - prefer parsed hours
  let mergedHours = siteA.hours
  if (siteB.hours.length > 0 && siteB.hours.some(h => h.parsed)) {
    mergedHours = siteB.hours
  }

  // Choose most specific name
  const mergedName = siteA.name.length > siteB.name.length ? siteA.name : siteB.name

  // Merge flags
  const mergedFlags = {
    flag_address_geo_mismatch: siteA.flags.flag_address_geo_mismatch || siteB.flags.flag_address_geo_mismatch || hasGeoMismatch,
    flag_unparseable_hours: siteA.flags.flag_unparseable_hours || siteB.flags.flag_unparseable_hours,
    flag_broken_url: siteA.flags.flag_broken_url || siteB.flags.flag_broken_url,
    flag_stale_record: siteA.flags.flag_stale_record || siteB.flags.flag_stale_record,
    flag_sparse_record: siteA.flags.flag_sparse_record && siteB.flags.flag_sparse_record,
  }

  // Merge raw data - keep conflicts
  const mergedRaw = {
    ...siteA.raw,
    source_merge: {
      sources: [siteA.source, siteB.source],
      conflicts: hasGeoMismatch ? {
        location_a: siteA.location,
        location_b: siteB.location,
        distance_m: distance,
      } : undefined,
    },
  }

  return {
    ...siteA,
    site_id: `merged:${siteA.site_id}:${siteB.site_id}`,
    name: mergedName,
    location: preferredLocation,
    address: preferredAddress,
    website: mergedWebsite,
    phones: mergedPhones,
    hours: mergedHours,
    flags: mergedFlags,
    raw: mergedRaw,
  }
}

/**
 * Deduplicate sites - merge duplicates, keep unique sites
 * @param proximityThresholdM Proximity threshold (75m for fridges, 125m for LMS)
 */
export function deduplicateSites(
  sites: LASite[],
  proximityThresholdM: number = 125
): LASite[] {
  const unique: LASite[] = []
  const seenIds = new Set<string>()

  for (const site of sites) {
    // Check if this is a duplicate
    let mergeTarget: LASite | null = null

    for (const existing of unique) {
      if (
        isSameSite(site, existing, proximityThresholdM) ||
        isProbableDuplicate(site, existing, proximityThresholdM)
      ) {
        mergeTarget = existing
        break
      }
    }

    if (mergeTarget) {
      // Merge the sites
      const merged = crossSourceMerge(mergeTarget, site)
      // Replace the existing site with merged
      const idx = unique.indexOf(mergeTarget)
      unique[idx] = merged
      seenIds.add(merged.site_id)
    } else if (!seenIds.has(site.site_id)) {
      unique.push(site)
      seenIds.add(site.site_id)
    }
  }

  return unique
}

