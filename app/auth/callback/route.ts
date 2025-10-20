import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${error.message}`)
    }

    // Get user to create profile if it doesn't exist
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profile')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      // Create profile if it doesn't exist
      if (!existingProfile) {
        await supabase
          .from('profile')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            role: 'contributor',
          })
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(`${requestUrl.origin}/`)
}

