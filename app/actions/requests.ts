'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItemRequest(fridgeId: string, category: string, detail?: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (!fridgeId || !category) {
    return { success: false, error: 'Missing required fields' }
  }

  const { error } = await supabase
    .from('item_request')
    .insert({
      fridge_id: fridgeId,
      category,
      detail: detail || null,
      created_by: user.id,
    })

  if (error) {
    console.error('Request error:', error)
    return { success: false, error: 'Failed to create request' }
  }

  revalidatePath(`/fridge/${fridgeId}`)
  
  return { success: true }
}

export async function updateItemRequestStatus(
  requestId: string,
  status: 'open' | 'fulfilled' | 'withdrawn'
) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the request to check permissions
  const { data: request, error: fetchError } = await supabase
    .from('item_request')
    .select('*, fridge_id')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { success: false, error: 'Request not found' }
  }

  // Check if user is the creator or an admin
  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const canUpdate = request.created_by === user.id || profile?.role === 'admin'
  
  if (!canUpdate) {
    return { success: false, error: 'Not authorized' }
  }

  const updateData: { status: typeof status; fulfilled_at?: string } = { status }
  if (status === 'fulfilled') {
    updateData.fulfilled_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('item_request')
    .update(updateData)
    .eq('id', requestId)

  if (error) {
    console.error('Update error:', error)
    return { success: false, error: 'Failed to update request' }
  }

  revalidatePath(`/fridge/${request.fridge_id}`)
  
  return { success: true }
}

