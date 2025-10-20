'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { authorized: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Not authorized' }
  }

  return { authorized: true, userId: user.id }
}

export async function createFridge(data: {
  name: string
  description?: string
  address?: string
  lat: number
  lng: number
  accessibility?: Record<string, boolean> | null
}) {
  const auth = await checkAdmin()
  if (!auth.authorized) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  
  const { data: fridge, error } = await supabase
    .from('fridge')
    .insert({
      ...data,
      created_by: auth.userId,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Create fridge error:', error)
    return { success: false, error: 'Failed to create fridge' }
  }

  revalidatePath('/')
  revalidatePath('/admin/fridges')
  
  return { success: true, fridge }
}

export async function updateFridge(id: string, data: {
  name?: string
  description?: string
  address?: string
  lat?: number
  lng?: number
  accessibility?: Record<string, boolean> | null
  is_active?: boolean
}) {
  const auth = await checkAdmin()
  if (!auth.authorized) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('fridge')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Update fridge error:', error)
    return { success: false, error: 'Failed to update fridge' }
  }

  revalidatePath('/')
  revalidatePath('/admin/fridges')
  revalidatePath(`/fridge/${id}`)
  
  return { success: true }
}

export async function createRoute(name: string, description?: string) {
  const auth = await checkAdmin()
  if (!auth.authorized) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  
  const { data: route, error } = await supabase
    .from('route')
    .insert({
      name,
      description: description || null,
      created_by: auth.userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Create route error:', error)
    return { success: false, error: 'Failed to create route' }
  }

  revalidatePath('/admin/routes')
  revalidatePath('/volunteer/routes')
  
  return { success: true, route }
}

export async function addFridgeToRoute(routeId: string, fridgeId: string, sortOrder: number = 0) {
  const auth = await checkAdmin()
  if (!auth.authorized) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('route_fridge')
    .insert({
      route_id: routeId,
      fridge_id: fridgeId,
      sort_order: sortOrder,
    })

  if (error) {
    console.error('Add fridge to route error:', error)
    return { success: false, error: 'Failed to add fridge to route' }
  }

  revalidatePath('/admin/routes')
  revalidatePath('/volunteer/routes')
  
  return { success: true }
}

export async function removeFridgeFromRoute(routeId: string, fridgeId: string) {
  const auth = await checkAdmin()
  if (!auth.authorized) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('route_fridge')
    .delete()
    .eq('route_id', routeId)
    .eq('fridge_id', fridgeId)

  if (error) {
    console.error('Remove fridge from route error:', error)
    return { success: false, error: 'Failed to remove fridge from route' }
  }

  revalidatePath('/admin/routes')
  revalidatePath('/volunteer/routes')
  
  return { success: true }
}

