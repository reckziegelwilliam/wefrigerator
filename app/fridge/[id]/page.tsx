import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusTimeline } from '@/components/StatusTimeline'
import { InventoryChips } from '@/components/InventoryChips'
import { ItemRequests } from '@/components/ItemRequests'
import { PickupWindows } from '@/components/PickupWindows'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, Package } from 'lucide-react'

interface FridgePageProps {
  params: Promise<{ id: string }>
}

export default async function FridgePage({ params }: FridgePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get fridge details
  const { data: fridge, error: fridgeError } = await supabase
    .from('fridge')
    .select('*')
    .eq('id', id)
    .single()

  if (fridgeError || !fridge) {
    notFound()
  }

  // Get status history
  const { data: statuses } = await supabase
    .from('fridge_status')
    .select('*')
    .eq('fridge_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get inventory
  const { data: inventory } = await supabase
    .from('fridge_inventory')
    .select('*')
    .eq('fridge_id', id)
    .single()

  // Get item requests
  const { data: requests } = await supabase
    .from('item_request')
    .select('*')
    .eq('fridge_id', id)
    .order('created_at', { ascending: false })

  // Get upcoming pickup windows
  const { data: pickupWindows } = await supabase
    .from('pickup_window')
    .select('*')
    .eq('fridge_id', id)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {fridge.name}
              </h1>
              {fridge.address && (
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {fridge.address}
                </p>
              )}
              {fridge.description && (
                <p className="text-foreground/80 mt-3">
                  {fridge.description}
                </p>
              )}
              
              <div className="flex gap-2 mt-4 text-sm">
                {fridge.accessibility?.['24_7'] && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                    24/7 Access
                  </span>
                )}
                {fridge.accessibility?.wheelchair && (
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">
                    ♿ Wheelchair Accessible
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/update/${fridge.id}`}>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Update
                </Button>
              </Link>
              <Link href={`/requests/${fridge.id}/new`}>
                <Button variant="outline" className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Request Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <StatusTimeline statuses={statuses || []} />
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* Current Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>What&apos;s available now</CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryChips inventory={inventory} showAll />
              </CardContent>
            </Card>

            {/* Item Requests */}
            <ItemRequests requests={requests || []} canFulfill={!!user} />

            {/* Pickup Windows */}
            <PickupWindows windows={pickupWindows || []} />
          </div>
        </div>
      </div>
    </main>
  )
}

