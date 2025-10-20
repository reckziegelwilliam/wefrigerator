import { ExternalPlaceWithSource } from '@/lib/types'
import { Clock, Phone, Globe, MapPinned, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  formatOperatingHours,
  extractPhoneNumber,
  formatPhoneForDisplay,
  formatPhoneForLink,
  extractWebsite,
  getSiteTypeLabel,
  getAccessModelLabel,
} from '@/lib/utils/external-data'

interface ExternalSourceInfoProps {
  externalPlace: ExternalPlaceWithSource
  variant?: 'card' | 'detail'
}

export function ExternalSourceInfo({ externalPlace }: ExternalSourceInfoProps) {
  const siteType = getSiteTypeLabel(externalPlace.raw)
  const accessModel = getAccessModelLabel(externalPlace.raw)
  const hours = formatOperatingHours(externalPlace.raw)
  const phone = extractPhoneNumber(externalPlace.raw)
  const website = extractWebsite(externalPlace.raw)

  const hasAnyInfo = siteType || accessModel || hours.length > 0 || phone || website

  if (!hasAnyInfo) return null

  return (
    <div className="space-y-3">
      {/* Site Type and Access Model Badges */}
      {(siteType || accessModel) && (
        <div className="flex flex-wrap gap-2">
          {siteType && (
            <Badge variant="secondary" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              {siteType}
            </Badge>
          )}
          {accessModel && (
            <Badge variant="outline" className="text-xs">
              <MapPinned className="w-3 h-3 mr-1" />
              {accessModel}
            </Badge>
          )}
        </div>
      )}

      {/* Operating Hours */}
      {hours.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="w-4 h-4" />
            <span>Hours</span>
          </div>
          <div className="text-sm text-muted-foreground pl-5 space-y-0.5">
            {hours.map((hour, index) => (
              <div key={index}>{hour}</div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {(phone || website) && (
        <div className="space-y-2">
          {phone && (
            <div className="flex items-center gap-1.5 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${formatPhoneForLink(phone)}`}
                className="text-primary hover:underline"
              >
                {formatPhoneForDisplay(phone)}
              </a>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-1.5 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

