import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { InventoryChips } from './InventoryChips'
import { formatRelative } from '@/lib/utils/date'
import { MapPin, Clock } from 'lucide-react'
import { FridgeWithStatus } from '@/lib/types'

interface FridgeCardProps {
  fridge: FridgeWithStatus
}

export function FridgeCard({ fridge }: FridgeCardProps) {
  const hasWheelchairAccess = fridge.accessibility?.wheelchair
  const is24_7 = fridge.accessibility?.['24_7']

  return (
    <Link href={`/fridge/${fridge.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{fridge.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                <span className="truncate">{fridge.address || 'Address not provided'}</span>
              </CardDescription>
            </div>
            {fridge.latest_status && (
              <StatusBadge status={fridge.latest_status.status} />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {fridge.latest_status && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>Updated {formatRelative(fridge.latest_status.created_at)}</span>
            </div>
          )}

          {fridge.latest_status?.note && (
            <p className="text-sm text-foreground/80 line-clamp-2">
              {fridge.latest_status.note}
            </p>
          )}

          {fridge.inventory && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Available:</p>
              <InventoryChips inventory={fridge.inventory} />
            </div>
          )}

          {fridge.open_requests_count !== undefined && fridge.open_requests_count > 0 && (
            <div className="text-sm font-medium" style={{ color: '#FFB020' }}>
              {fridge.open_requests_count} item{fridge.open_requests_count !== 1 ? 's' : ''} requested
            </div>
          )}

          <div className="flex gap-2 text-xs">
            {is24_7 && <span className="px-2 py-1 bg-primary/10 text-primary rounded">24/7 Access</span>}
            {hasWheelchairAccess && <span className="px-2 py-1 bg-accent/10 text-accent rounded">♿ Accessible</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

