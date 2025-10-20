/**
 * Calculate distance between two geographic points using Haversine formula
 * @param a First point with lat/lng
 * @param b Second point with lat/lng
 * @returns Distance in meters
 */
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const R = 6371000 // Earth's radius in meters

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)

  const a_calc =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng

  const c = 2 * Math.asin(Math.sqrt(a_calc))

  return R * c
}

/**
 * Calculate simple string similarity using Dice coefficient
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score between 0 and 1
 */
export function stringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 1

  const normalize = (s: string) => s.toLowerCase().trim()
  const s1 = normalize(str1)
  const s2 = normalize(str2)

  if (s1 === s2) return 1
  if (s1.length < 2 || s2.length < 2) return 0

  // Get bigrams (pairs of adjacent characters)
  const getBigrams = (str: string): Set<string> => {
    const bigrams = new Set<string>()
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2))
    }
    return bigrams
  }

  const bigrams1 = getBigrams(s1)
  const bigrams2 = getBigrams(s2)

  // Count intersection
  let intersection = 0
  bigrams1.forEach((bigram) => {
    if (bigrams2.has(bigram)) {
      intersection++
    }
  })

  // Dice coefficient: 2 * |intersection| / (|set1| + |set2|)
  return (2 * intersection) / (bigrams1.size + bigrams2.size)
}

/**
 * Format distance in meters to human-readable string
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "150 m" or "1.5 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

