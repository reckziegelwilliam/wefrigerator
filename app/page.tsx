import { createClient } from '@/lib/supabase/server'
import { FridgeMap } from '@/components/FridgeMap'
import { FridgeCard } from '@/components/FridgeCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FridgeWithStatus } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Image from 'next/image'

async function getFridges(): Promise<FridgeWithStatus[]> {
  const supabase = await createClient()

  // Get fridges with their latest status and inventory
  const { data: fridges, error } = await supabase
    .from('fridge')
    .select(`
      *,
      fridge_status (
        id,
        fridge_id,
        status,
        note,
        photo_path,
        created_by,
        created_at
      ),
      fridge_inventory (*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching fridges:', error)
    return []
  }

  // Transform data to include latest status and count open requests
  const fridgesWithStatus: FridgeWithStatus[] = await Promise.all(
    (fridges || []).map(async (fridge) => {
      // Get latest status
      const latestStatus = fridge.fridge_status?.[0] || null

      // Get inventory
      const inventory = Array.isArray(fridge.fridge_inventory)
        ? fridge.fridge_inventory[0]
        : fridge.fridge_inventory

      // Count open requests
      const { count } = await supabase
        .from('item_request')
        .select('*', { count: 'exact', head: true })
        .eq('fridge_id', fridge.id)
        .eq('status', 'open')

      return {
        ...fridge,
        latest_status: latestStatus,
        inventory,
        open_requests_count: count || 0,
      }
    })
  )

  // Sort by latest status time
  return fridgesWithStatus.sort((a, b) => {
    const aTime = a.latest_status?.created_at || a.created_at
    const bTime = b.latest_status?.created_at || b.created_at
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
}

export default async function HomePage() {
  const fridges = await getFridges()

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative bg-secondary/30 border-b overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/hero-1600x900.svg"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              {/* Wordmark Logo */}
              <div className="mb-4">
                <Image
                  src="/wordmark-lockup.svg"
                  alt="wefrigerator"
                  width={280}
                  height={60}
                  priority
                  className="mx-auto md:mx-0"
                />
              </div>
              <p className="text-foreground/80 text-lg max-w-xl">
                Find and support community fridges in your area
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/volunteer/routes">
                <Button variant="outline" size="lg">Volunteer</Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Update
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <FridgeMap fridges={fridges} showImportsToggle={true} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fridges.slice(0, 6).map((fridge) => (
                <FridgeCard key={fridge.id} fridge={fridge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {fridges.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/empty-state-800x600.svg"
                    alt="No fridges found"
                    width={400}
                    height={300}
                    className="opacity-60"
                  />
                </div>
                <p className="text-muted-foreground text-lg">No fridges found in your area</p>
                <p className="text-muted-foreground/70 text-sm mt-2">Check back soon or help us add one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fridges.map((fridge) => (
                  <FridgeCard key={fridge.id} fridge={fridge} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-8 p-6 bg-card rounded-lg border">
          <h3 className="font-semibold mb-4 text-foreground">Status Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3AD29F' }} />
              <span className="text-sm text-foreground">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#2EA7F2' }} />
              <span className="text-sm text-foreground">Stocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFB020' }} />
              <span className="text-sm text-foreground">Needs Items</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded-full" />
              <span className="text-sm text-foreground">Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 wefrigerator. Supporting community food access.</p>
            <div className="flex gap-6">
              <Link href="/data-sources" className="hover:text-foreground transition-colors">
                Data Sources & Licenses
              </Link>
              <Link href="/profile" className="hover:text-foreground transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
