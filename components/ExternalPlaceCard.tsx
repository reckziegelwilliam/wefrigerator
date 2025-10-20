import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, AlertCircle } from 'lucide-react'
import { ExternalPlaceWithSource } from '@/lib/types'
import { ExternalSourceInfo } from '@/components/ExternalSourceInfo'

interface ExternalPlaceCardProps {
  place: ExternalPlaceWithSource
}

const sourceNames: Record<string, string> = {
  osm_overpass: 'OpenStreetMap',
  lac_charitable_food: 'LA County',
  freedge: 'Freedge',
}

export function ExternalPlaceCard({ place }: ExternalPlaceCardProps) {
  const sourceName = place.source ? sourceNames[place.source.name] || place.source.name : 'External Source'
  
  return (
    <Card className="h-full border-dashed border-2 opacity-75 hover:opacity-100 transition-opacity">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="truncate text-base">{place.name || 'Unnamed Location'}</CardTitle>
              <Badge variant="outline" className="shrink-0 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unverified
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              <span className="truncate">{place.address || 'Address not provided'}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* External Source Information */}
        <ExternalSourceInfo externalPlace={place} variant="card" />

        {/* Source Attribution */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              Source: {sourceName}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            This location has been imported from {sourceName} but hasn&apos;t been verified yet. 
            If you know about this fridge, please contact an admin to verify it.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

