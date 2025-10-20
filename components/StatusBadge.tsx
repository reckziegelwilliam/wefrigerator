import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { StatusType } from '@/lib/types'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'text-white',
    // Fresh Green #3AD29F
  },
  stocked: {
    label: 'Stocked',
    className: 'text-white',
    // Fridge Blue #2EA7F2
  },
  needs: {
    label: 'Needs Items',
    className: 'text-white',
    // Warm Amber #FFB020
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted hover:bg-muted/80 text-muted-foreground',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  // Map status to brand colors
  const statusStyles: Record<string, React.CSSProperties> = {
    open: { backgroundColor: '#3AD29F' },
    stocked: { backgroundColor: '#2EA7F2' },
    needs: { backgroundColor: '#FFB020' },
  }
  
  return (
    <Badge 
      className={cn(config.className, className)} 
      style={statusStyles[status]}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  )
}

