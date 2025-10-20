import {
  OSMTags,
  LASiteType,
  LAServiceTag,
  LAPopulationTag,
  LAAccessModel,
  LAOrgType,
  LAFreshnessBucket,
} from '@/lib/types'
import { cleanText } from './la-normalization'

/**
 * Classify OSM site type based on amenity and other tags
 */
export function classifyOSMSiteType(tags: OSMTags): LASiteType | null {
  const amenity = tags.amenity?.toLowerCase()
  const socialFacility = tags['social_facility']?.toLowerCase()
  
  // Community fridge (food sharing)
  if (amenity === 'food_sharing') {
    return 'community_fridge'
  }

  // Food bank
  if (amenity === 'food_bank') {
    return 'food_bank'
  }

  // Social facility handling
  if (amenity === 'social_facility') {
    if (socialFacility === 'soup_kitchen' || socialFacility === 'food_bank') {
      return 'soup_kitchen'
    }
    if (socialFacility === 'shelter' || tags['social_facility:for'] === 'homeless') {
      return 'shelter'
    }
  }

  // Other amenities
  if (amenity === 'shelter') {
    return 'shelter'
  }

  return null
}

/**
 * Extract service tags from OSM tags
 */
export function extractOSMServiceTags(tags: OSMTags): LAServiceTag[] {
  const serviceTags: LAServiceTag[] = []
  const amenity = tags.amenity?.toLowerCase()
  
  // Community fridge
  if (amenity === 'food_sharing') {
    serviceTags.push('community_fridge')
    serviceTags.push('mutual_aid')
  }

  // Food bank
  if (amenity === 'food_bank') {
    serviceTags.push('food_bank_wholesale')
  }

  // Food pantry (if mentioned in description)
  const description = (tags.description || tags.note || '').toLowerCase()
  if (description.includes('pantry') || description.includes('food distribution')) {
    if (!serviceTags.includes('food_pantry')) {
      serviceTags.push('food_pantry')
    }
  }

  // Free store / Give box
  if (amenity === 'give_box' || description.includes('free store')) {
    if (!serviceTags.includes('free_store')) {
      serviceTags.push('free_store')
    }
  }

  // Meals
  if (description.includes('meal') || description.includes('soup kitchen')) {
    if (!serviceTags.includes('congregate_meal')) {
      serviceTags.push('congregate_meal')
    }
  }

  // Shelter
  if (amenity === 'shelter' || tags['social_facility'] === 'shelter') {
    if (!serviceTags.includes('shelter')) {
      serviceTags.push('shelter')
    }
  }

  return serviceTags
}

/**
 * Extract population tags from OSM tags
 */
export function extractOSMPopulationTags(tags: OSMTags): LAPopulationTag[] {
  const populationTags: LAPopulationTag[] = []
  
  const text = [
    tags.description,
    tags.note,
    tags['social_facility:for'],
    tags.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  // Seniors
  if (/\b(senior|elderly|60\+|over 60)\b/.test(text)) {
    populationTags.push('seniors_60_plus')
  }

  // Families with children
  if (/\b(families|children|kids|youth programs)\b/.test(text)) {
    populationTags.push('families_with_children')
  }

  // Homeless
  if (/\b(homeless|unhoused|housing insecure)\b/.test(text)) {
    populationTags.push('homeless')
  }

  // Veterans
  if (/\b(veteran|vets)\b/.test(text)) {
    populationTags.push('veterans')
  }

  // Youth
  if (/\b(youth|teen|young adult)\b/.test(text)) {
    populationTags.push('youth')
  }

  // Access restrictions
  if (tags.access === 'permissive') {
    populationTags.push('access_permissive')
  }

  return populationTags
}

/**
 * Determine access model from OSM tags
 */
export function determineOSMAccessModel(
  tags: OSMTags,
  openingHours: string | undefined
): LAAccessModel | null {
  // Check for 24/7 access
  if (openingHours) {
    const cleaned = openingHours.toLowerCase().trim()
    if (cleaned === '24/7' || cleaned === '24 hours' || cleaned === 'always open') {
      return 'twenty_four_seven'
    }
  }

  // Check access tag
  const access = tags.access?.toLowerCase()
  
  // Private access suggests appointment
  if (access === 'private' || access === 'customers') {
    return 'appointment'
  }

  // If we have structured hours, it's scheduled
  if (openingHours && /\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/.test(openingHours)) {
    return 'scheduled_days'
  }

  // Default to walk-in for community fridges
  if (tags.amenity === 'food_sharing') {
    return 'walk_in'
  }

  return null
}

/**
 * Classify organization type from OSM tags
 */
export function classifyOSMOrgType(tags: OSMTags): LAOrgType | null {
  const operator = tags.operator?.toLowerCase() || ''
  const name = tags.name?.toLowerCase() || ''
  const description = tags.description?.toLowerCase() || ''
  
  const text = `${operator} ${name} ${description}`

  // Faith-based
  if (
    /\b(church|ministry|parish|synagogue|mosque|temple|cathedral|chapel)\b/.test(text)
  ) {
    return 'faith_based'
  }

  // Government
  if (
    /\b(city|county|state|federal|municipal|government|public|dept)\b/.test(text)
  ) {
    return 'government'
  }

  // Collective / Mutual Aid
  if (
    /\b(collective|mutual aid|community|grassroots|volunteer)\b/.test(text) ||
    tags.amenity === 'food_sharing'
  ) {
    return 'collective'
  }

  // Nonprofit (default for most food assistance)
  if (operator || name.includes('foundation') || name.includes('organization')) {
    return 'nonprofit'
  }

  return null
}

/**
 * Calculate freshness bucket from OSM timestamp
 */
export function calculateOSMFreshnessBucket(timestamp: string | undefined): LAFreshnessBucket | null {
  if (!timestamp) return null

  try {
    const date = new Date(timestamp)
    const now = new Date()
    const monthsAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)

    if (monthsAgo < 12) return '<12mo'
    if (monthsAgo < 24) return '12_24mo'
    return '>24mo'
  } catch {
    return null
  }
}

/**
 * Extract organization root name from OSM tags
 */
export function extractOSMOrgRootName(tags: OSMTags): string | null {
  // Prefer operator
  if (tags.operator) {
    return cleanText(tags.operator)
  }

  // Fallback to name (but try to strip location suffixes)
  if (tags.name) {
    let name = cleanText(tags.name)
    if (!name) return null

    // Remove common location suffixes
    name = name.replace(/\s*[-–—]\s*(North|South|East|West|Downtown|Central)\s*$/i, '')
    name = name.replace(/\s*\((Main|Branch|Site)\)\s*$/i, '')
    
    return name
  }

  return null
}

