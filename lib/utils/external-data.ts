import { LAHours, LAPhone, LASiteType, LAAccessModel } from '@/lib/types'

/**
 * Extract and format operating hours from external place raw data
 */
export function formatOperatingHours(raw: Record<string, unknown> | null): string[] {
  if (!raw || !raw.hours) return []

  const hours = raw.hours as LAHours[]
  if (!Array.isArray(hours) || hours.length === 0) return []

  return hours.map((h) => {
    const days = h.days || ''
    const opens = h.opens ? formatTime(h.opens) : null
    const closes = h.closes ? formatTime(h.closes) : null
    const notes = h.notes

    if (opens && closes) {
      const timeRange = `${opens} - ${closes}`
      return notes ? `${days}: ${timeRange} (${notes})` : `${days}: ${timeRange}`
    } else if (notes) {
      return `${days}: ${notes}`
    } else {
      return days
    }
  }).filter(Boolean)
}

/**
 * Format time string to 12-hour format with AM/PM
 */
function formatTime(time: string): string {
  // Handle formats like "09:00", "9:00", "0900"
  const cleaned = time.replace(/[^\d:]/g, '')
  const parts = cleaned.includes(':') ? cleaned.split(':') : [cleaned.slice(0, -2), cleaned.slice(-2)]
  
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0

  if (isNaN(hours)) return time

  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Extract primary phone number from external place raw data
 */
export function extractPhoneNumber(raw: Record<string, unknown> | null): { number: string; label: string | null; ext: string | null } | null {
  if (!raw || !raw.phones) return null

  const phones = raw.phones as LAPhone[]
  if (!Array.isArray(phones) || phones.length === 0) return null

  // Prefer non-fax numbers
  const nonFax = phones.find(p => p.label?.toLowerCase() !== 'fax')
  const phone = nonFax || phones[0]

  return {
    number: phone.number,
    label: phone.label,
    ext: phone.ext,
  }
}

/**
 * Format phone number for display and tel: link
 */
export function formatPhoneForDisplay(phone: { number: string; label: string | null; ext: string | null }): string {
  let display = phone.number
  if (phone.ext) {
    display += ` ext. ${phone.ext}`
  }
  if (phone.label) {
    display += ` (${phone.label})`
  }
  return display
}

/**
 * Format phone number for tel: link (digits only)
 */
export function formatPhoneForLink(phone: { number: string; ext: string | null }): string {
  const digits = phone.number.replace(/\D/g, '')
  return phone.ext ? `${digits},${phone.ext}` : digits
}

/**
 * Extract website URL from external place raw data
 */
export function extractWebsite(raw: Record<string, unknown> | null): string | null {
  if (!raw) return null

  const website = raw.website as string | null
  if (!website || typeof website !== 'string') return null

  // Ensure URL has protocol
  if (!website.startsWith('http://') && !website.startsWith('https://')) {
    return `https://${website}`
  }

  return website
}

/**
 * Get human-readable site type label
 */
export function getSiteTypeLabel(raw: Record<string, unknown> | null): string | null {
  if (!raw || !raw.site_type) return null

  const siteType = raw.site_type as LASiteType

  const labels: Record<LASiteType, string> = {
    community_fridge: 'Community Fridge',
    food_pantry: 'Food Pantry',
    food_bank: 'Food Bank',
    soup_kitchen: 'Soup Kitchen',
    senior_meals: 'Senior Meals',
    shelter: 'Shelter',
    multi_service: 'Multi-Service Center',
    church_program: 'Church Program',
    gov_center: 'Government Center',
    youth_center: 'Youth Center',
  }

  return labels[siteType] || null
}

/**
 * Get human-readable access model label
 */
export function getAccessModelLabel(raw: Record<string, unknown> | null): string | null {
  if (!raw || !raw.access_model) return null

  const accessModel = raw.access_model as LAAccessModel

  const labels: Record<LAAccessModel, string> = {
    walk_in: 'Walk-in',
    appointment: 'Appointment Required',
    scheduled_days: 'Scheduled Days',
    twenty_four_seven: '24/7 Access',
  }

  return labels[accessModel] || null
}

