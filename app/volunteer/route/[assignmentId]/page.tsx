import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { RouteStepper } from '@/components/RouteStepper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import { FridgeWithStatus, RouteWithFridges } from '@/lib/types'

interface RouteAssignmentPageProps {
  params: Promise<{ assignmentId: string }>
}

export default async function RouteAssignmentPage({ params }: RouteAssignmentPageProps) {
  const { assignmentId } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get assignment details
  const { data: assignment, error } = await supabase
    .from('route_assignment')
    .select(`
      *,
      route (
        id,
        name,
        description,
        route_fridge (
          fridge_id,
          sort_order,
          fridge (*)
        )
      )
    `)
    .eq('id', assignmentId)
    .single()

  if (error || !assignment) {
    notFound()
  }

  // Check if user is the assigned volunteer
  if (assignment.volunteer_id !== user.id) {
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      redirect('/volunteer/routes')
    }
  }

  // Transform fridges data
  const fridges = ((assignment.route as RouteWithFridges)?.fridges || [])
    .map((rf: FridgeWithStatus) => rf)
    .sort((a: FridgeWithStatus, b: FridgeWithStatus) => {
      const aOrder = ((assignment.route as RouteWithFridges)?.fridges || []).find(
        (rf: FridgeWithStatus) => rf.id === a.id
      )?.sort_order || 0
      const bOrder = ((assignment.route as RouteWithFridges)?.fridges || []).find(
        (rf: FridgeWithStatus) => rf.id === b.id
      )?.sort_order || 0
      return aOrder - bOrder
    })

  if (assignment.status === 'completed') {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link href="/volunteer/routes">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Routes
            </Button>
          </Link>

          <div className="bg-white rounded-lg border p-8 text-center">
            <Badge className="mb-4">Completed</Badge>
            <h1 className="text-2xl font-bold mb-2">
              {(assignment.route as RouteWithFridges)?.name}
            </h1>
            <p className="text-gray-600">
              This route was completed on {formatDate(assignment.date, 'PPP')}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/volunteer/routes">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Routes
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {(assignment.route as RouteWithFridges)?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Scheduled for {formatDate(assignment.date, 'PPP')}
          </p>
          {(assignment.route as RouteWithFridges)?.description && (
            <p className="text-gray-700 mt-2">
              {(assignment.route as RouteWithFridges).description}
            </p>
          )}
        </div>

        <RouteStepper assignmentId={assignmentId} fridges={fridges} />
      </div>
    </main>
  )
}

