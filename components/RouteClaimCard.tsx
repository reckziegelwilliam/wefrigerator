'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar as CalendarIcon } from 'lucide-react'
import { claimRoute } from '@/app/actions/routes'
import { toast } from 'sonner'
import { RouteWithFridges } from '@/lib/types'
import { format } from 'date-fns'

interface RouteClaimCardProps {
  route: RouteWithFridges
}

export function RouteClaimCard({ route }: RouteClaimCardProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [claiming, setClaiming] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleClaim = async () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }

    setClaiming(true)

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      const result = await claimRoute(route.id, dateString)

      if (result.success && result.assignmentId) {
        toast.success('Route claimed successfully!')
        setDialogOpen(false)
        router.push(`/volunteer/route/${result.assignmentId}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to claim route')
      }
    } catch (error) {
      console.error('Claim error:', error)
      toast.error('An error occurred')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{route.name}</CardTitle>
            <CardDescription className="mt-1">
              {route.description || 'No description'}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {route.fridges?.length || 0} fridges
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {route.fridges && route.fridges.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Route stops:</p>
            <div className="space-y-1">
              {route.fridges
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((fridge, index) => (
                  <div key={fridge.id} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-400">{index + 1}.</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{fridge.name}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Claim This Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a Date</DialogTitle>
              <DialogDescription>
                Choose when you&apos;d like to complete this route
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            <Button
              onClick={handleClaim}
              disabled={!selectedDate || claiming}
              className="w-full"
            >
              {claiming ? 'Claiming...' : 'Confirm & Claim Route'}
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

