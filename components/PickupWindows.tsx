import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTimeRange, isUpcoming } from '@/lib/utils/date'
import { Calendar, Users } from 'lucide-react'
import { PickupWindow } from '@/lib/types'

interface PickupWindowsProps {
  windows: PickupWindow[]
}

export function PickupWindows({ windows }: PickupWindowsProps) {
  const upcomingWindows = windows
    .filter(w => isUpcoming(w.starts_at))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())

  if (upcomingWindows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pickup & Drop-off Windows</CardTitle>
          <CardDescription>No upcoming windows scheduled</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Pickup & Drop-off Windows
        </CardTitle>
        <CardDescription>Scheduled times for donations and pickups</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingWindows.map((window) => (
          <div
            key={window.id}
            className="p-3 rounded-lg border bg-blue-50 border-blue-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge
                variant={window.type === 'dropoff' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {window.type}
              </Badge>
              {window.capacity && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  <span>Capacity: {window.capacity}</span>
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatTimeRange(window.starts_at, window.ends_at)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

