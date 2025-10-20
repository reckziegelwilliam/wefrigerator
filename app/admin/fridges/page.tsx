import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, MapPin } from 'lucide-react'
import Link from 'next/link'
import { formatRelative } from '@/lib/utils/date'
import Image from 'next/image'

async function getFridges() {
  const supabase = await createClient()

  const { data: fridges, error } = await supabase
    .from('fridge')
    .select(`
      *,
      fridge_status (
        id,
        status,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching fridges:', error)
    return []
  }

  return fridges || []
}

export default async function AdminFridgesPage() {
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

  const fridges = await getFridges()

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
            <h1 className="text-3xl font-bold text-foreground">Manage Fridges</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all community fridges
            </p>
            <div className="flex gap-2 mt-4">
              <Link href="/admin/imports">
                <Button variant="outline" size="sm">Import Management</Button>
              </Link>
              <Link href="/admin/routes">
                <Button variant="outline" size="sm">Manage Routes</Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" size="sm">Reports</Button>
              </Link>
            </div>
          </div>
          <Link href="/admin/fridges/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Fridge
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fridges.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/empty-state-800x600.svg"
                    alt="No fridges found"
                    width={300}
                    height={225}
                    className="opacity-60"
                  />
                </div>
                <p className="text-muted-foreground text-lg mb-2">No fridges yet</p>
                <p className="text-muted-foreground/70 text-sm">Click &quot;Add Fridge&quot; to create your first community fridge.</p>
              </CardContent>
            </Card>
          ) : (
            fridges.map((fridge) => {
              const latestStatus = fridge.fridge_status?.[0]
              
              return (
                <Card key={fridge.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{fridge.name}</CardTitle>
                      <Badge variant={fridge.is_active ? 'default' : 'secondary'}>
                        {fridge.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {fridge.address || 'No address'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fridge.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {fridge.description}
                      </p>
                    )}
                    
                    {latestStatus && (
                      <div className="text-xs text-muted-foreground">
                        Last update: {formatRelative(latestStatus.created_at)}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/fridge/${fridge.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/fridges/edit/${fridge.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Edit
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

