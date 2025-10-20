'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function postStatus(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Parse form data
  const fridgeId = formData.get('fridgeId') as string
  const status = formData.get('status') as string
  const note = formData.get('note') as string | null

  if (!fridgeId || !status) {
    return { success: false, error: 'Missing required fields' }
  }

  if (!['open', 'stocked', 'needs', 'closed'].includes(status)) {
    return { success: false, error: 'Invalid status' }
  }

  // Handle photo upload if present
  let photoPath: string | null = null
  const photoFile = formData.get('photo') as File | null
  
  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${fridgeId}/${randomUUID()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, photoFile, {
        contentType: photoFile.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload photo' }
    }

    photoPath = fileName
  }

  // Insert status update
  const { error: statusError } = await supabase
    .from('fridge_status')
    .insert({
      fridge_id: fridgeId,
      status,
      note: note || null,
      photo_path: photoPath,
      created_by: user.id,
    })

  if (statusError) {
    console.error('Status error:', statusError)
    return { success: false, error: 'Failed to save status' }
  }

  // Update inventory if provided
  const inventoryKeys = ['produce', 'canned', 'grains', 'dairy', 'baby', 'hygiene', 'water']
  const inventoryData: Record<string, boolean> = {}
  let hasInventory = false

  for (const key of inventoryKeys) {
    const value = formData.get(key)
    if (value !== null) {
      hasInventory = true
      inventoryData[key] = value === 'true' || value === 'on'
    }
  }

  if (hasInventory) {
    const { error: inventoryError } = await supabase
      .from('fridge_inventory')
      .upsert({
        fridge_id: fridgeId,
        ...inventoryData,
        last_updated_by: user.id,
        updated_at: new Date().toISOString(),
      })

    if (inventoryError) {
      console.error('Inventory error:', inventoryError)
      // Don't fail the whole operation if inventory update fails
    }
  }

  revalidatePath('/')
  revalidatePath(`/fridge/${fridgeId}`)
  
  return { success: true }
}

