'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelative } from '@/lib/utils/date'
import { Check, Package } from 'lucide-react'
import { ItemRequest } from '@/lib/types'
import { toast } from 'sonner'
import { updateItemRequestStatus } from '@/app/actions/requests'

interface ItemRequestsProps {
  requests: ItemRequest[]
  canFulfill?: boolean
}

export function ItemRequests({ requests, canFulfill = false }: ItemRequestsProps) {
  const [fulfilling, setFulfilling] = useState<string | null>(null)

  const handleFulfill = async (requestId: string) => {
    setFulfilling(requestId)
    
    const result = await updateItemRequestStatus(requestId, 'fulfilled')
    
    if (result.success) {
      toast.success('Request marked as fulfilled')
    } else {
      toast.error(result.error || 'Failed to update request')
    }
    
    setFulfilling(null)
  }

  const openRequests = requests.filter(r => r.status === 'open')
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled')

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Item Requests</CardTitle>
          <CardDescription>No item requests yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Item Requests
          {openRequests.length > 0 && (
            <Badge variant="secondary">{openRequests.length} open</Badge>
          )}
        </CardTitle>
        <CardDescription>Community needs for this fridge</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {openRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-start justify-between gap-3 p-3 rounded-lg border"
            style={{ 
              backgroundColor: 'rgba(255, 176, 32, 0.1)', 
              borderColor: 'rgba(255, 176, 32, 0.3)' 
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {request.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(request.created_at)}
                </span>
              </div>
              {request.detail && (
                <p className="text-sm text-foreground/80">{request.detail}</p>
              )}
            </div>
            {canFulfill && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFulfill(request.id)}
                disabled={fulfilling === request.id}
              >
                <Check className="w-4 h-4 mr-1" />
                Fulfill
              </Button>
            )}
          </div>
        ))}

        {fulfilledRequests.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recently Fulfilled:</p>
            {fulfilledRequests.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground"
              >
                <Check className="w-4 h-4" style={{ color: '#3AD29F' }} />
                <span className="flex-1">{request.category}</span>
                <span className="text-xs">
                  {request.fulfilled_at && formatRelative(request.fulfilled_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

