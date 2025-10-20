import {
  LASiteType,
  LAServiceTag,
  LAPopulationTag,
  LAAccessModel,
  LAOrgType,
  LAFreshnessBucket,
} from '@/lib/types'

/**
 * Extract organization root name from raw data
 * Removes site/program suffixes and prefers org_name field
 */
export function extractOrgRootName(
  name: string | null,
  orgName: string | null,
  websiteDomain: string | null
): string | null {
  // Prefer org_name if available
  if (orgName && orgName.trim()) {
    return orgName.trim()
  }

  if (!name) {
    // Fallback to domain
    return websiteDomain ? websiteDomain.split('.')[0] : null
  }

  let cleaned = name.trim()

  // Remove common site suffixes
  const suffixes = [
    /\s*[-–—]\s*(Hollywood|Valley|Downtown|East|West|North|South|Central)\s*$/i,
    /\s*[-–—]\s*Bread\s+And\s+Roses\s+Cafe\s*$/i,
    /\s*[-–—]\s*Homeless\s+Service\s+Center\s*$/i,
    /\s*[-–—]\s*(Campus|Center|Site|Location|Branch)\s*$/i,
    /\s*[-–—]\s*\d+\s*$/,
    /\s*\((Main|Branch|Site)\)\s*$/i,
  ]

  for (const suffix of suffixes) {
    cleaned = cleaned.replace(suffix, '').trim()
  }

  return cleaned || name
}

/**
 * Classify the primary site type based on description and categories
 */
export function classifySiteType(
  description: string | null,
  cat1: string | null,
  cat2: string | null,
  cat3: string | null,
  name: string | null
): LASiteType | null {
  const text = [description, cat1, cat2, cat3, name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  // Food bank (wholesale to agencies)
  if (
    /\b(food\s+bank|distribut(es?|ing)\s+to\s+(member\s+)?(charities|agencies))\b/.test(text)
  ) {
    return 'food_bank'
  }

  // Shelter
  if (/\b(shelter|emergency\s+housing|24\s*hour.*\bbed)\b/.test(text)) {
    return 'shelter'
  }

  // Senior meals
  if (
    /\b(senior|60\s*\+|congregate\s+dining|dining\s+center|home\s+delivered\s+meal)\b/.test(
      text
    ) &&
    /\bmeal/i.test(text)
  ) {
    return 'senior_meals'
  }

  // Soup kitchen / congregate meals
  if (/\b(soup\s+kitchen|cafe|dining|meals?\s+served|free\s+meal)\b/.test(text)) {
    return 'soup_kitchen'
  }

  // Government center
  if (
    /\b(city\s+of|county|department|municipal|government)\b/.test(text) &&
    /\b(recreation|human\s+services|social\s+services)\b/.test(text)
  ) {
    return 'gov_center'
  }

  // Church program
  if (
    /\b(church|ministry|parish|synagogue|mosque|temple|faith\s+based)\b/.test(text)
  ) {
    return 'church_program'
  }

  // Youth center
  if (/\b(youth|boys\s+and\s+girls|ymca|ywca)\b/.test(text)) {
    return 'youth_center'
  }

  // Multi-service (counseling, utility aid, employment, etc.)
  if (
    /\b(counseling|utility\s+aid|employment|job\s+training|immigration|legal\s+aid)\b/.test(
      text
    )
  ) {
    return 'multi_service'
  }

  // Default to food pantry
  if (/\b(food|pantry|distribution|emergency)\b/.test(text)) {
    return 'food_pantry'
  }

  return null
}

/**
 * Extract service tags from description and categories
 */
export function extractServiceTags(
  description: string | null,
  cat1: string | null,
  cat2: string | null,
  cat3: string | null
): LAServiceTag[] {
  const text = [description, cat1, cat2, cat3]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const tags: LAServiceTag[] = []

  if (/\b(food\s+pantry|emergency\s+food|food\s+distribution)\b/.test(text)) {
    tags.push('food_pantry')
  }

  if (/\b(food\s+bank|distribut(es?|ing)\s+to\s+agencies)\b/.test(text)) {
    tags.push('food_bank_wholesale')
  }

  if (/\b(congregate\s+meal|dining|cafe|meals?\s+served)\b/.test(text)) {
    tags.push('congregate_meal')
  }

  if (/\b(home\s+delivered|meals?\s+on\s+wheels)\b/.test(text)) {
    tags.push('home_delivered_meal')
  }

  if (/\b(holiday\s+meal|thanksgiving|christmas)\b/.test(text)) {
    tags.push('holiday_meal')
  }

  if (/\b(shelter|emergency\s+housing)\b/.test(text)) {
    tags.push('shelter')
  }

  if (/\b(utility\s+aid|utility\s+assistance|energy\s+assistance)\b/.test(text)) {
    tags.push('utility_aid')
  }

  if (/\b(counseling|therapy|mental\s+health)\b/.test(text)) {
    tags.push('counseling')
  }

  if (/\b(employment|job\s+training|job\s+placement|workforce)\b/.test(text)) {
    tags.push('employment')
  }

  if (/\b(immigration|visa|citizenship)\b/.test(text)) {
    tags.push('immigration')
  }

  if (/\b(youth\s+program|after\s+school|tutoring|mentoring)\b/.test(text)) {
    tags.push('youth_programs')
  }

  if (/\b(senior\s+service|60\s*\+|elderly|aging)\b/.test(text)) {
    tags.push('senior_services')
  }

  if (/\b(health\s+clinic|medical|dental|vision)\b/.test(text)) {
    tags.push('health_clinic')
  }

  return tags
}

/**
 * Extract population tags from description
 */
export function extractPopulationTags(
  description: string | null,
  hours: string | null
): LAPopulationTag[] {
  const text = [description, hours].filter(Boolean).join(' ').toLowerCase()

  const tags: LAPopulationTag[] = []

  if (/\b(senior|60\s*\+|elderly|aging)\b/.test(text)) {
    tags.push('seniors_60_plus')
  }

  if (/\b(famil(y|ies)|children|kids|parents)\b/.test(text)) {
    tags.push('families_with_children')
  }

  if (/\b(homeless|unhoused|shelter)\b/.test(text)) {
    tags.push('homeless')
  }

  if (/\b(hiv|aids)\b/.test(text)) {
    tags.push('hiv_aids')
  }

  if (/\b(undocumented|immigration\s+status|regardless\s+of\s+status)\b/.test(text)) {
    tags.push('undocumented')
  }

  if (/\b(zip\s+code|restricted\s+to|residents\s+of)\b/.test(text)) {
    tags.push('zip_restricted')
  }

  if (/\b(youth|teen|adolescent|young\s+adult)\b/.test(text)) {
    tags.push('youth')
  }

  if (/\b(veteran|military|va)\b/.test(text)) {
    tags.push('veterans')
  }

  return tags
}

/**
 * Determine access model from hours and description
 */
export function determineAccessModel(
  hours: string | null,
  description: string | null
): LAAccessModel | null {
  const text = [hours, description].filter(Boolean).join(' ').toLowerCase()

  if (/\b(24\s*hours?|24\s*\/\s*7|open\s+24)\b/.test(text)) {
    return 'twenty_four_seven'
  }

  if (
    /\b(\d+(?:st|nd|rd|th)\s+(?:and|&)\s+\d+(?:st|nd|rd|th))\b/.test(text) ||
    /\b(specific\s+day|designated\s+day)\b/.test(text)
  ) {
    return 'scheduled_days'
  }

  if (/\b(appointment|call\s+ahead|by\s+appointment|schedule)\b/.test(text)) {
    return 'appointment'
  }

  if (/\b(walk[\s-]?in|open\s+to\s+public|no\s+appointment)\b/.test(text)) {
    return 'walk_in'
  }

  // Default to walk-in if hours are provided
  if (hours) {
    return 'walk_in'
  }

  return null
}

/**
 * Classify organization type
 */
export function classifyOrgType(
  name: string | null,
  orgName: string | null,
  description: string | null
): LAOrgType | null {
  const text = [name, orgName, description].filter(Boolean).join(' ').toLowerCase()

  if (
    /\b(church|ministry|parish|synagogue|mosque|temple|cathedral|baptist|catholic|lutheran|methodist|presbyterian)\b/.test(
      text
    )
  ) {
    return 'faith_based'
  }

  if (
    /\b(city\s+of|county|department|municipal|government|public\s+health)\b/.test(text)
  ) {
    return 'government'
  }

  return 'nonprofit'
}

/**
 * Calculate freshness bucket based on updated_at date
 */
export function calculateFreshnessBucket(updatedAt: string | null): LAFreshnessBucket | null {
  if (!updatedAt) return null

  try {
    const updated = new Date(updatedAt)
    const now = new Date()
    const monthsAgo = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24 * 30)

    if (monthsAgo < 12) return '<12mo'
    if (monthsAgo < 24) return '12_24mo'
    return '>24mo'
  } catch {
    return null
  }
}

