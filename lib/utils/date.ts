import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'

export function formatDate(date: string | Date, formatString: string = 'PPp'): string {
  return format(new Date(date), formatString)
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isUpcoming(date: string | Date): boolean {
  return isAfter(new Date(date), new Date())
}

export function isPast(date: string | Date): boolean {
  return isBefore(new Date(date), new Date())
}

export function formatTimeRange(start: string | Date, end: string | Date): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  // If same day, show date once with time range
  if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
    return `${format(startDate, 'PPP')} • ${format(startDate, 'p')} - ${format(endDate, 'p')}`
  }
  
  // Different days
  return `${format(startDate, 'PPp')} - ${format(endDate, 'PPp')}`
}

