import { LAFreshnessBucket, LAFlags, LASiteType, LAServiceTag } from '@/lib/types'

/**
 * Compute recency score based on freshness bucket
 */
export function computeRecencyScore(freshnessBucket: LAFreshnessBucket | null): number {
  if (!freshnessBucket) return 0.2

  switch (freshnessBucket) {
    case '<12mo':
      return 1.0
    case '12_24mo':
      return 0.6
    case '>24mo':
      return 0.2
    default:
      return 0.2
  }
}

/**
 * Compute open-now score (placeholder - requires query time)
 */
export function computeOpenNowScore(): number {
  // This would need current time and parsed hours to compute
  // For now, return 0.0 as specified
  return 0.0
}

/**
 * Compute specificity score based on food-related types and tags
 */
export function computeSpecificityScore(
  siteType: LASiteType | null,
  serviceTags: LAServiceTag[]
): number {
  let score = 0.0

  // Boost for food-specific site types
  const foodTypes: LASiteType[] = [
    'community_fridge',
    'food_pantry',
    'food_bank',
    'soup_kitchen',
    'senior_meals',
  ]

  if (siteType && foodTypes.includes(siteType)) {
    score += 0.5
  }

  // Boost for food-specific service tags
  const foodServiceTags: LAServiceTag[] = [
    'community_fridge',
    'mutual_aid',
    'free_store',
    'food_pantry',
    'food_bank_wholesale',
    'congregate_meal',
    'home_delivered_meal',
    'holiday_meal',
  ]

  const hasFoodServices = serviceTags.some((tag) => foodServiceTags.includes(tag))
  if (hasFoodServices) {
    score += 0.3
  }

  // Cap at 1.0
  return Math.min(score, 1.0)
}

/**
 * Compute population fit score (placeholder - requires user context)
 */
export function computePopulationFitScore(): number {
  // This would need user demographics or filter context to compute
  // For now, return default score
  return 0.6
}

/**
 * Generate quality flags for a site
 */
export function generateQualityFlags(
  lat: number,
  lon: number,
  hours: { parsed: boolean }[],
  website: string | null,
  freshnessBucket: LAFreshnessBucket | null,
  phones: unknown[] = []
): LAFlags {
  // Address/geo mismatch - would need geocoding to verify, default to false
  const flag_address_geo_mismatch = false

  // Unparseable hours
  const flag_unparseable_hours = hours.some((h) => !h.parsed)

  // Broken URL - check if URL is valid
  let flag_broken_url = false
  if (website) {
    try {
      new URL(website)
    } catch {
      flag_broken_url = true
    }
  }

  // Stale record (>24mo)
  const flag_stale_record = freshnessBucket === '>24mo'

  // Sparse record - missing both phones and hours
  const flag_sparse_record = phones.length === 0 && hours.length === 0

  return {
    flag_address_geo_mismatch,
    flag_unparseable_hours,
    flag_broken_url,
    flag_stale_record,
    flag_sparse_record,
  }
}

