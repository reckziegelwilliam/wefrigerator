'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { formatDate, formatRelative } from '@/lib/utils/date'
import { Clock } from 'lucide-react'
import { FridgeStatus } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface StatusTimelineProps {
  statuses: FridgeStatus[]
}

export function StatusTimeline({ statuses }: StatusTimelineProps) {
  const supabase = createClient()
  const [photoError, setPhotoError] = useState<Record<string, boolean>>({})

  const getPhotoUrl = (photoPath: string | null) => {
    if (!photoPath) return null
    const { data } = supabase.storage.from('photos').getPublicUrl(photoPath)
    return data.publicUrl
  }

  if (statuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>No status updates yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const latestStatus = statuses[0]
  const photoUrl = latestStatus.photo_path ? getPhotoUrl(latestStatus.photo_path) : null

  return (
    <div className="space-y-4">
      {/* Latest status with photo */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>
                Updated {formatRelative(latestStatus.created_at)}
              </CardDescription>
            </div>
            <StatusBadge status={latestStatus.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {photoUrl && !photoError[latestStatus.id] && (
            <img
              src={photoUrl}
              alt="Current fridge status"
              className="w-full h-64 object-cover rounded-lg"
              onError={() => setPhotoError(prev => ({ ...prev, [latestStatus.id]: true }))}
            />
          )}
          {latestStatus.note && (
            <p className="text-foreground/80">{latestStatus.note}</p>
          )}
        </CardContent>
      </Card>

      {/* Status history */}
      {statuses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statuses.slice(1, 6).map((status) => {
                const statusPhotoUrl = status.photo_path ? getPhotoUrl(status.photo_path) : null
                
                return (
                  <div key={status.id} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className="flex-shrink-0 pt-1">
                      <StatusBadge status={status.status} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(status.created_at)}</span>
                      </div>
                      {status.note && (
                        <p className="text-sm text-foreground/80">{status.note}</p>
                      )}
                      {statusPhotoUrl && !photoError[status.id] && (
                        <img
                          src={statusPhotoUrl}
                          alt={`Status update from ${formatDate(status.created_at)}`}
                          className="w-full h-32 object-cover rounded"
                          onError={() => setPhotoError(prev => ({ ...prev, [status.id]: true }))}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

