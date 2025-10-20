import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RouteClaimCard } from '@/components/RouteClaimCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import { FridgeWithStatus, RouteAssignmentWithDetails, RouteWithFridges } from '@/lib/types'
import Image from 'next/image'

async function getRoutes() {
  const supabase = await createClient()

  const { data: routes, error } = await supabase
    .from('route')
    .select(`
      *,
      route_fridge (
        fridge_id,
        sort_order,
        fridge (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching routes:', error)
    return []
  }

  // Transform data
  return (routes || []).map((route: RouteWithFridges) => ({
    ...route,
    fridges: (route.fridges || []).map((rf: FridgeWithStatus & { sort_order: number }) => ({
      ...rf,
      sort_order: rf.sort_order,
    })),
  })) as RouteWithFridges[]
}

async function getMyAssignments(userId: string): Promise<RouteAssignmentWithDetails[]> {
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('route_assignment')
    .select(`
      *,
      route (
        id,
        name,
        description
      )
    `)
    .eq('volunteer_id', userId)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  return assignments || []
}

export default async function VolunteerRoutesPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is volunteer or admin
  const { data: profile } = await supabase
    .from('profile')
    .select('role, display_name')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['volunteer', 'admin'].includes(profile.role)) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Access Required</CardTitle>
              <CardDescription>
                You need volunteer access to view routes. Please contact an administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const routes = await getRoutes()
  const myAssignments = await getMyAssignments(user.id)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Volunteer Routes</h1>
          <p className="text-muted-foreground mt-2">
            Claim a route to help check and restock community fridges
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Assignments */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  My Assignments
                </CardTitle>
                <CardDescription>Upcoming route visits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {myAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming assignments</p>
                ) : (
                  myAssignments.map((assignment: RouteAssignmentWithDetails) => (
                    <Link
                      key={assignment.id}
                      href={`/volunteer/route/${assignment.id}`}
                      className="block"
                    >
                      <div className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{assignment.route?.name}</p>
                          <Badge
                            variant={
                              assignment.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {assignment.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(assignment.date, 'PPP')}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Routes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Available Routes</h2>
            {routes.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="flex justify-center mb-6">
                    <Image
                      src="/empty-state-800x600.svg"
                      alt="No routes available"
                      width={300}
                      height={225}
                      className="opacity-60"
                    />
                  </div>
                  <p className="text-muted-foreground text-lg mb-2">No routes available yet</p>
                  <p className="text-muted-foreground/70 text-sm">Check back soon for volunteer opportunities!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((route) => (
                  <RouteClaimCard key={route.id} route={route} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

