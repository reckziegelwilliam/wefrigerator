import { LAAddress, LAPhone, LAHours } from '@/lib/types'

/**
 * Clean and normalize text - trim, collapse whitespace, remove trailing punctuation
 */
export function cleanText(text: string | null | undefined): string | null {
  if (!text || typeof text !== 'string') return null
  
  // Trim and collapse multiple spaces
  let cleaned = text.trim().replace(/\s+/g, ' ')
  
  // Remove trailing punctuation (except periods in abbreviations)
  cleaned = cleaned.replace(/[,;:!?]+$/, '')
  
  return cleaned || null
}

/**
 * Title case a string (capitalize first letter of each word)
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
 * Normalize an address from LA County data
 */
export function normalizeAddress(props: Record<string, unknown>): LAAddress {
  const street1Raw = (props.addrln1 || props.Address || props.ADDRESS || null) as string | null
  const street2Raw = (props.addrln2 || null) as string | null
  const cityRaw = (props.city || props.City || props.CITY || null) as string | null
  const stateRaw = (props.state || props.State || props.STATE || null) as string | null
  const zipRaw = (props.zip || props.Zip || props.ZIP || null) as string | null

  // Normalize street1
  let street1 = cleanText(street1Raw)
  if (street1) {
    street1 = toTitleCase(street1)
  }

  // Normalize street2
  let street2 = cleanText(street2Raw)
  if (street2) {
    street2 = toTitleCase(street2)
  }

  // Normalize city
  let city = cleanText(cityRaw)
  if (city) {
    city = toTitleCase(city)
  }

  // Normalize state (uppercase two-letter code)
  let state = cleanText(stateRaw)
  if (state) {
    state = state.toUpperCase().substring(0, 2)
  }

  // Normalize zip (5-digit string)
  let zip = cleanText(zipRaw)
  if (zip) {
    // Extract first 5 digits
    const match = zip.match(/\d{5}/)
    zip = match ? match[0] : zip.substring(0, 5)
  }

  return {
    street1,
    street2,
    city,
    state,
    zip,
  }
}

/**
 * Normalize and parse phone numbers from comma-separated string
 */
export function normalizePhones(phonesRaw: string | null | undefined): LAPhone[] {
  if (!phonesRaw || typeof phonesRaw !== 'string') return []

  const phones: LAPhone[] = []
  
  // Split by comma or semicolon
  const parts = phonesRaw.split(/[,;]/).map(p => p.trim()).filter(Boolean)

  for (const part of parts) {
    // Detect common labels
    let label: string | null = null
    let numberPart = part

    // Check for known labels
    const labelPatterns = [
      { pattern: /\b(fax)\b/i, label: 'FAX' },
      { pattern: /\b(service|intake)\b/i, label: 'Service/Intake' },
      { pattern: /\b(admin|administration)\b/i, label: 'Administration' },
      { pattern: /\b(hotline)\b/i, label: 'Hotline' },
      { pattern: /\b(info|information)\b/i, label: 'Info' },
      { pattern: /\b(24\s*hour|24\s*hr)\b/i, label: '24 Hour' },
      { pattern: /\b(volunteer)\b/i, label: 'Volunteer' },
    ]

    for (const { pattern, label: detectedLabel } of labelPatterns) {
      if (pattern.test(part)) {
        label = detectedLabel
        numberPart = part.replace(pattern, '').trim()
        break
      }
    }

    // Extract extension
    let ext: string | null = null
    const extMatch = numberPart.match(/\b(ext|extension|x)[:\s]*(\d+)/i)
    if (extMatch) {
      ext = extMatch[2]
      numberPart = numberPart.replace(extMatch[0], '').trim()
    }

    // Clean the number (remove everything except digits, parentheses, dashes, spaces)
    const cleanedNumber = numberPart.replace(/[^\d\s\-()]/g, '').trim()

    if (cleanedNumber) {
      phones.push({
        label,
        number: cleanedNumber,
        ext,
      })
    }
  }

  return phones
}

/**
 * Parse hours string into structured format
 */
export function normalizeHours(hoursRaw: string | null | undefined): LAHours[] {
  if (!hoursRaw || typeof hoursRaw !== 'string') return []

  const cleaned = cleanText(hoursRaw)
  if (!cleaned) return []

  // Try to parse structured hours
  const hours: LAHours[] = []

  // Pattern for "Mon-Fri 9:00 AM - 5:00 PM" or similar
  const rangePattern = /\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[\s\-]+(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)?\s*[:,]?\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*[-–—to]+\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/i

  // Pattern for "24 hours" or "24/7"
  const twentyFourPattern = /\b(24\s*hours?|24\s*\/\s*7|open\s+24|twenty[\s-]?four\s+hours?)\b/i

  // Pattern for specific days like "1st and 3rd Wednesday"
  const scheduledPattern = /\b(\d+(?:st|nd|rd|th))\s+(?:and|&)\s+(\d+(?:st|nd|rd|th))\s+(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i

  if (twentyFourPattern.test(cleaned)) {
    hours.push({
      days: '24/7',
      opens: null,
      closes: null,
      notes: null,
      parsed: true,
    })
  } else if (scheduledPattern.test(cleaned)) {
    const match = cleaned.match(scheduledPattern)
    if (match) {
      hours.push({
        days: `${match[1]}&${match[2]} ${match[3]}`,
        opens: null,
        closes: null,
        notes: cleaned,
        parsed: true,
      })
    }
  } else if (rangePattern.test(cleaned)) {
    const match = cleaned.match(rangePattern)
    if (match) {
      const day1 = match[1].charAt(0).toUpperCase() + match[1].slice(1, 3).toLowerCase()
      const day2 = match[2] ? match[2].charAt(0).toUpperCase() + match[2].slice(1, 3).toLowerCase() : null
      const days = day2 ? `${day1}-${day2}` : day1

      // Parse opening time
      let opens = match[3]
      if (match[4]) opens += ':' + match[4]
      if (match[5]?.toLowerCase() === 'pm' && !opens.startsWith('12')) {
        const hour = parseInt(match[3])
        opens = `${hour + 12}:${match[4] || '00'}`
      } else {
        opens = `${match[3].padStart(2, '0')}:${match[4] || '00'}`
      }

      // Parse closing time
      let closes = match[6]
      if (match[7]) closes += ':' + match[7]
      if (match[8]?.toLowerCase() === 'pm' && !closes.startsWith('12')) {
        const hour = parseInt(match[6])
        closes = `${hour + 12}:${match[7] || '00'}`
      } else {
        closes = `${match[6].padStart(2, '0')}:${match[7] || '00'}`
      }

      hours.push({
        days,
        opens,
        closes,
        notes: null,
        parsed: true,
      })
    }
  } else {
    // Unparseable - store as notes
    hours.push({
      days: 'See notes',
      opens: null,
      closes: null,
      notes: cleaned,
      parsed: false,
    })
  }

  return hours
}

/**
 * Normalize URL and extract domain
 */
export function normalizeUrl(
  urlRaw: string | null | undefined
): { url: string | null; domain: string | null } {
  if (!urlRaw || typeof urlRaw !== 'string') {
    return { url: null, domain: null }
  }

  let url = cleanText(urlRaw)
  if (!url || url.toLowerCase() === 'null' || url === 'N/A') {
    return { url: null, domain: null }
  }

  // Add https:// if missing scheme
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url
  }

  // Try to parse URL
  let domain: string | null = null
  try {
    const parsed = new URL(url)
    domain = parsed.hostname.replace(/^www\./, '')
  } catch {
    // Invalid URL
    return { url: null, domain: null }
  }

  return { url, domain }
}

/**
 * Parse date_updated (epoch milliseconds) to ISO UTC string
 */
export function parseDateUpdated(dateUpdated: number | string | null | undefined): string | null {
  if (!dateUpdated) return null

  try {
    const timestamp = typeof dateUpdated === 'string' ? parseInt(dateUpdated) : dateUpdated
    if (isNaN(timestamp)) return null

    const date = new Date(timestamp)
    return date.toISOString()
  } catch {
    return null
  }
}

