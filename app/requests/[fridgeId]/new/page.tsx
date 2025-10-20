import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { RequestForm } from '@/components/RequestForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface NewRequestPageProps {
  params: Promise<{ fridgeId: string }>
}

export default async function NewRequestPage({ params }: NewRequestPageProps) {
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
    .select('id, name')
    .eq('id', fridgeId)
    .single()

  if (error || !fridge) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/fridge/${fridgeId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fridge
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Request Items</CardTitle>
            <CardDescription>
              Request items needed at {fridge.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RequestForm fridgeId={fridgeId} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

