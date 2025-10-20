import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUnlinkedExternalPlaces } from '@/app/actions/imports'
import { ImportsList } from './ImportsList'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ImportsPage() {
  const supabase = await createClient()

  // Check authentication and admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Get unlinked external places
  const externalPlaces = await getUnlinkedExternalPlaces()

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Management</h1>
        <p className="text-muted-foreground">
          Review and manage locations from external data sources
        </p>
        <div className="flex gap-2 mt-4">
          <Link href="/admin/fridges">
            <Button variant="outline" size="sm">Manage Fridges</Button>
          </Link>
          <Link href="/admin/routes">
            <Button variant="outline" size="sm">Manage Routes</Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" size="sm">Reports</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>OSM Overpass</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>LA County</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Freedge</span>
          </div>
        </div>
      </div>

      <ImportsList places={externalPlaces} />
    </div>
  )
}

