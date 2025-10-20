'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, MapPin } from 'lucide-react'
import { addRouteCheck, completeRouteAssignment } from '@/app/actions/routes'
import { toast } from 'sonner'
import { Fridge } from '@/lib/types'

interface RouteStepperProps {
  assignmentId: string
  fridges: Fridge[]
}

interface CheckData {
  condition: string
  note: string
}

export function RouteStepper({ assignmentId, fridges }: RouteStepperProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [checks, setChecks] = useState<Record<string, CheckData>>({})
  const [submitting, setSubmitting] = useState(false)

  const currentFridge = fridges[currentStep]
  const isLastStep = currentStep === fridges.length - 1
  const progress = ((currentStep + 1) / fridges.length) * 100

  const handleNext = async () => {
    const check = checks[currentFridge.id]
    
    if (!check?.condition) {
      toast.error('Please select a condition')
      return
    }

    setSubmitting(true)

    try {
      const result = await addRouteCheck(
        assignmentId,
        currentFridge.id,
        check.condition,
        check.note
      )

      if (result.success) {
        if (isLastStep) {
          // Complete the route
          const completeResult = await completeRouteAssignment(assignmentId)
          
          if (completeResult.success) {
            toast.success('Route completed! Great work!')
            router.push('/volunteer/routes')
            router.refresh()
          } else {
            toast.error(completeResult.error || 'Failed to complete route')
          }
        } else {
          setCurrentStep(currentStep + 1)
          toast.success('Check recorded')
        }
      } else {
        toast.error(result.error || 'Failed to save check')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const updateCheck = (field: 'condition' | 'note', value: string) => {
    setChecks({
      ...checks,
      [currentFridge.id]: {
        ...checks[currentFridge.id],
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Stop {currentStep + 1} of {fridges.length}
              </span>
              <span className="text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Current Fridge Check */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {currentFridge.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {currentFridge.address || 'No address provided'}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {currentStep + 1}/{fridges.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Condition */}
          <div className="space-y-3">
            <Label>Fridge Condition *</Label>
            <RadioGroup
              value={checks[currentFridge.id]?.condition || ''}
              onValueChange={(value) => updateCheck('condition', value)}
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="clean" id="clean" />
                <label htmlFor="clean" className="cursor-pointer flex-1">
                  <div className="font-medium">Clean</div>
                  <div className="text-sm text-gray-500">In good condition</div>
                </label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="needs_cleaning" id="needs_cleaning" />
                <label htmlFor="needs_cleaning" className="cursor-pointer flex-1">
                  <div className="font-medium">Needs Cleaning</div>
                  <div className="text-sm text-gray-500">Requires attention</div>
                </label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="overflowing" id="overflowing" />
                <label htmlFor="overflowing" className="cursor-pointer flex-1">
                  <div className="font-medium">Overflowing</div>
                  <div className="text-sm text-gray-500">Too much inventory</div>
                </label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="empty" id="empty" />
                <label htmlFor="empty" className="cursor-pointer flex-1">
                  <div className="font-medium">Empty</div>
                  <div className="text-sm text-gray-500">Needs restocking</div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional observations or actions taken..."
              value={checks[currentFridge.id]?.note || ''}
              onChange={(e) => updateCheck('note', e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || submitting}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                'Saving...'
              ) : isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Route
                </>
              ) : (
                'Next Stop'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

