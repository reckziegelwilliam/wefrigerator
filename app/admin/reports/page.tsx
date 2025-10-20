import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Activity, Package, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { NeedyFridge } from '@/lib/types'

async function getStats(): Promise<{
  totalFridges: number
  weeklyUpdates: number
  fulfilledRequests: number
  completedRoutes: number
  needyFridges: NeedyFridge[]
}> {
  const supabase = await createClient()

  // Get total fridges
  const { count: totalFridges } = await supabase
    .from('fridge')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get status updates this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count: weeklyUpdates } = await supabase
    .from('fridge_status')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString())

  // Get fulfilled requests this week
  const { count: fulfilledRequests } = await supabase
    .from('item_request')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'fulfilled')
    .gte('fulfilled_at', oneWeekAgo.toISOString())

  // Get completed routes this week
  const { count: completedRoutes } = await supabase
    .from('route_assignment')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('created_at', oneWeekAgo.toISOString())

  // Get fridges with most needs
  const { data: needyFridges } = await supabase
    .from('fridge')
    .select(`
      id,
      name,
      fridge_status!inner (
        status,
        created_at
      )
    `)
    .eq('fridge_status.status', 'needs')
    .eq('is_active', true)
    .order('fridge_status(created_at)', { ascending: false })
    .limit(5)

  return {
    totalFridges: totalFridges || 0,
    weeklyUpdates: weeklyUpdates || 0,
    fulfilledRequests: fulfilledRequests || 0,
    completedRoutes: completedRoutes || 0,
    needyFridges: (needyFridges || []) as NeedyFridge[],
  }
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const stats = await getStats()

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
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Weekly activity overview and insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fridges</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFridges}</div>
              <p className="text-xs text-muted-foreground">Active locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Updates</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyUpdates}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests Fulfilled</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fulfilledRequests}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Routes Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRoutes}</div>
              <p className="text-xs text-muted-foreground">By volunteers</p>
            </CardContent>
          </Card>
        </div>

        {/* High-Need Fridges */}
        <Card>
          <CardHeader>
            <CardTitle>Fridges Needing Attention</CardTitle>
            <CardDescription>
              Locations currently marked as needing items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.needyFridges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No fridges currently need attention</p>
            ) : (
              <div className="space-y-3">
                {stats.needyFridges.map((fridge) => (
                  <Link
                    key={fridge.id}
                    href={`/fridge/${fridge.id}`}
                    className="block p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: '#FFB020' }} />
                        <span className="font-medium">{fridge.name}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

