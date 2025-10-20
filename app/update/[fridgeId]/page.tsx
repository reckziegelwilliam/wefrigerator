import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { UpdateForm } from '@/components/UpdateForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface UpdatePageProps {
  params: Promise<{ fridgeId: string }>
}

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { fridgeId } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get fridge details
  const { data: fridge, error } = await supabase
    .from('fridge')
    .select('*, fridge_inventory(*)')
    .eq('id', fridgeId)
    .single()

  if (error || !fridge) {
    notFound()
  }

  const inventory = Array.isArray(fridge.fridge_inventory)
    ? fridge.fridge_inventory[0]
    : fridge.fridge_inventory

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href={`/fridge/${fridgeId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fridge
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Post Status Update</CardTitle>
            <CardDescription>
              Update the status and inventory for {fridge.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateForm fridgeId={fridgeId} currentInventory={inventory} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

