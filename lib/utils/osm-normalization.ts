import { OSMTags, OSMElement, LAAddress, LAPhone, LAHours, LALocation } from '@/lib/types'
import { cleanText, normalizeUrl } from './la-normalization'
import crypto from 'crypto'

/**
 * Extract coordinates from OSM element
 * Nodes have lat/lon directly, ways/relations have center
 */
export function extractOSMCoordinates(element: OSMElement): LALocation | null {
  if (element.type === 'node' && element.lat && element.lon) {
    return { lat: element.lat, lon: element.lon }
  }
  
  if ((element.type === 'way' || element.type === 'relation') && element.center) {
    return { lat: element.center.lat, lon: element.center.lon }
  }
  
  return null
}

/**
 * Extract and normalize address from OSM addr:* tags
 */
export function extractOSMAddress(tags: OSMTags): LAAddress {
  const housenumber = tags['addr:housenumber']
  const street = tags['addr:street']
  const unit = tags['addr:unit']
  const city = tags['addr:city']
  const state = tags['addr:state']
  const postcode = tags['addr:postcode']

  // Build street1 from housenumber + street
  let street1: string | null = null
  if (housenumber && street) {
    street1 = `${housenumber} ${street}`.trim()
  } else if (street) {
    street1 = street.trim()
  }

  // Title case street if present
  if (street1) {
    street1 = toTitleCase(street1)
  }

  // Normalize street2 (unit)
  let street2 = cleanText(unit)
  if (street2) {
    street2 = toTitleCase(street2)
  }

  // Normalize city
  let cityNormalized = cleanText(city)
  if (cityNormalized) {
    cityNormalized = toTitleCase(cityNormalized)
  }

  // Normalize state (uppercase two-letter code, default to CA)
  let stateNormalized = cleanText(state)
  if (stateNormalized) {
    stateNormalized = stateNormalized.toUpperCase().substring(0, 2)
  } else {
    stateNormalized = 'CA' // Default to California
  }

  // Normalize zip (5-digit string)
  let zip = cleanText(postcode)
  if (zip) {
    const match = zip.match(/\d{5}/)
    zip = match ? match[0] : zip.substring(0, 5)
  }

  return {
    street1,
    street2,
    city: cityNormalized,
    state: stateNormalized,
    zip,
  }
}

/**
 * Title case helper
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Keep common abbreviations uppercase
      const upper = ['dr', 'st', 'ave', 'blvd', 'rd', 'ln', 'ct', 'pl', 'ca', 'la']
      if (upper.includes(word.replace(/\./g, ''))) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Extract and normalize phone numbers from OSM tags
 */
export function extractOSMPhones(tags: OSMTags): LAPhone[] {
  const phones: LAPhone[] = []
  
  // Primary phone
  if (tags.phone) {
    const cleaned = cleanPhoneNumber(tags.phone)
    if (cleaned) {
      phones.push({
        label: null,
        number: cleaned,
        ext: null,
      })
    }
  }

  // Contact phone
  if (tags['contact:phone']) {
    const cleaned = cleanPhoneNumber(tags['contact:phone'])
    if (cleaned && !phones.some(p => p.number === cleaned)) {
      phones.push({
        label: 'Contact',
        number: cleaned,
        ext: null,
      })
    }
  }

  // Mobile phone
  if (tags['contact:mobile']) {
    const cleaned = cleanPhoneNumber(tags['contact:mobile'])
    if (cleaned && !phones.some(p => p.number === cleaned)) {
      phones.push({
        label: 'Mobile',
        number: cleaned,
        ext: null,
      })
    }
  }

  return phones
}

/**
 * Clean phone number
 */
function cleanPhoneNumber(phone: string): string | null {
  if (!phone) return null
  
  // Remove everything except digits, parentheses, dashes, spaces, plus
  const cleaned = phone.replace(/[^\d\s\-()+ ]/g, '').trim()
  
  return cleaned || null
}

/**
 * Extract emails from OSM tags
 */
export function extractOSMEmails(tags: OSMTags): string[] {
  const emails: string[] = []
  
  if (tags.email) {
    const cleaned = cleanText(tags.email)
    if (cleaned && isValidEmail(cleaned)) {
      emails.push(cleaned)
    }
  }

  if (tags['contact:email']) {
    const cleaned = cleanText(tags['contact:email'])
    if (cleaned && isValidEmail(cleaned) && !emails.includes(cleaned)) {
      emails.push(cleaned)
    }
  }

  return emails
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Extract websites from OSM tags
 */
export function extractOSMWebsites(tags: OSMTags): string[] {
  const websites: string[] = []
  
  const urlFields = [
    tags.website,
    tags['contact:website'],
    tags.url,
    tags['contact:instagram'],
  ]

  for (const urlRaw of urlFields) {
    if (urlRaw) {
      const { url } = normalizeUrl(urlRaw)
      if (url && !websites.includes(url)) {
        websites.push(url)
      }
    }
  }

  return websites
}

/**
 * Extract images from OSM tags
 */
export function extractOSMImages(tags: OSMTags): string[] {
  const images: string[] = []
  
  // Primary image tag
  if (tags.image) {
    const { url } = normalizeUrl(tags.image)
    if (url) {
      images.push(url)
    }
  }

  // Look for image:* tags
  for (const key in tags) {
    if (key.startsWith('image:') && key !== 'image') {
      const { url } = normalizeUrl(tags[key])
      if (url && !images.includes(url)) {
        images.push(url)
      }
    }
  }

  return images
}

/**
 * Parse OSM opening_hours tag into LAHours array
 * Best-effort parser for common patterns
 */
export function parseOpeningHours(openingHours: string | undefined): LAHours[] {
  if (!openingHours || typeof openingHours !== 'string') {
    return []
  }

  const cleaned = cleanText(openingHours)
  if (!cleaned) return []

  const hours: LAHours[] = []

  // Pattern for 24/7
  if (/^(24\/7|24 hours?|always open)$/i.test(cleaned)) {
    return [{
      days: '24/7',
      opens: null,
      closes: null,
      notes: null,
      parsed: true,
    }]
  }

  // Pattern for day range with times: "Mo-Fr 09:00-17:00"
  const rangePattern = /\b(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/g
  
  let match
  let foundAny = false
  while ((match = rangePattern.exec(cleaned)) !== null) {
    foundAny = true
    const day1 = match[1]
    const day2 = match[2]
    const days = day2 ? `${day1}-${day2}` : day1

    const opens = `${match[3].padStart(2, '0')}:${match[4]}`
    const closes = `${match[5].padStart(2, '0')}:${match[6]}`

    hours.push({
      days,
      opens,
      closes,
      notes: null,
      parsed: true,
    })
  }

  if (foundAny) {
    return hours
  }

  // If we couldn't parse, store as notes
  return [{
    days: 'See notes',
    opens: null,
    closes: null,
    notes: cleaned,
    parsed: false,
  }]
}

/**
 * Compute a stable hash of OSM element for change detection
 */
export function computeRawHash(tags: OSMTags, lat: number, lon: number): string {
  // Sort tags by key for stability
  const sortedTags = Object.keys(tags || {})
    .sort()
    .map(key => `${key}=${tags[key]}`)
    .join('|')
  
  const data = `${sortedTags}|${lat.toFixed(7)}|${lon.toFixed(7)}`
  
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

