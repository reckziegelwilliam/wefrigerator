import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, MapPin } from 'lucide-react'
import Link from 'next/link'
import { RouteWithFridges } from '@/lib/types'
import { FridgeWithStatus } from '@/lib/types'
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
        fridge (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching routes:', error)
    return []
  }

  return routes || []
}

export default async function AdminRoutesPage() {
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

  const routes = await getRoutes()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Routes</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage volunteer routes
            </p>
          </div>
          <Link href="/admin/routes/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Route
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routes.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/map-1200x800.svg"
                    alt="No routes yet"
                    width={300}
                    height={200}
                    className="opacity-60"
                  />
                </div>
                <p className="text-muted-foreground text-lg mb-2">No routes yet</p>
                <p className="text-muted-foreground/70 text-sm">Click &quot;Create Route&quot; to set up your first volunteer route.</p>
              </CardContent>
            </Card>
          ) : (
            routes.map((route: RouteWithFridges) => {
              const fridges = (route.fridges || [])
                .sort((a: FridgeWithStatus & { sort_order: number }, b: FridgeWithStatus & { sort_order: number }) => a.sort_order - b.sort_order)
                .map((rf: FridgeWithStatus & { sort_order: number }) => rf)
              
              return (
                <Card key={route.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {route.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {fridges.length} {fridges.length === 1 ? 'stop' : 'stops'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fridges.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Route stops:</p>
                        <div className="space-y-1">
                          {fridges.map((fridge: FridgeWithStatus, index: number) => (
                            <div key={fridge.id} className="flex items-center gap-2 text-sm text-foreground/80">
                              <span className="text-muted-foreground">{index + 1}.</span>
                              <MapPin className="w-3 h-3" />
                              <span>{fridge.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link href={`/admin/routes/edit/${route.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Edit Route
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}

