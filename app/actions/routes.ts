'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimRoute(routeId: string, date: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user is volunteer or admin
  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['volunteer', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Must be a volunteer to claim routes' }
  }

  // Check if route is already claimed for this date
  const { data: existing } = await supabase
    .from('route_assignment')
    .select('id')
    .eq('route_id', routeId)
    .eq('date', date)
    .single()

  if (existing) {
    return { success: false, error: 'Route already claimed for this date' }
  }

  const { data, error } = await supabase
    .from('route_assignment')
    .insert({
      route_id: routeId,
      date,
      volunteer_id: user.id,
      status: 'claimed',
    })
    .select()
    .single()

  if (error) {
    console.error('Claim error:', error)
    return { success: false, error: 'Failed to claim route' }
  }

  revalidatePath('/volunteer/routes')
  
  return { success: true, assignmentId: data.id }
}

export async function addRouteCheck(
  assignmentId: string,
  fridgeId: string,
  condition: string,
  note?: string
) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('route_check')
    .insert({
      route_assignment_id: assignmentId,
      fridge_id: fridgeId,
      condition,
      note: note || null,
    })

  if (error) {
    console.error('Check error:', error)
    return { success: false, error: 'Failed to add check' }
  }

  revalidatePath(`/volunteer/route/${assignmentId}`)
  
  return { success: true }
}

export async function completeRouteAssignment(assignmentId: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('route_assignment')
    .update({ status: 'completed' })
    .eq('id', assignmentId)
    .eq('volunteer_id', user.id)

  if (error) {
    console.error('Complete error:', error)
    return { success: false, error: 'Failed to complete route' }
  }

  revalidatePath(`/volunteer/route/${assignmentId}`)
  revalidatePath('/volunteer/routes')
  
  return { success: true }
}

