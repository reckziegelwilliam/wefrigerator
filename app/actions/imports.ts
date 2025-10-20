'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ExternalPlaceWithSource, Fridge } from '@/lib/types'
import { haversineMeters, stringSimilarity } from '@/lib/utils/geo'

/**
 * Get all external places that haven't been linked to a fridge yet
 */
export async function getUnlinkedExternalPlaces(): Promise<
  (ExternalPlaceWithSource & {
    nearestFridge?: {
      id: string
      name: string
      distance: number
      similarity: number
    }
  })[]
> {
  const supabase = await createClient()

  // Get external places not linked to any fridge and not ignored
  const { data: externalPlaces, error: placesError } = await supabase
    .from('external_place')
    .select('*, source:external_source(*)')
    .is('id', null) // Not in fridge.external_place_id
    .eq('ignored', false)
    .order('created_at', { ascending: false })

  if (placesError) {
    console.error('Error fetching external places:', placesError)
    return []
  }

  // Get all fridges to calculate distances
  const { data: fridges, error: fridgesError } = await supabase
    .from('fridge')
    .select('id, name, lat, lng')

  if (fridgesError) {
    console.error('Error fetching fridges:', fridgesError)
    return externalPlaces as ExternalPlaceWithSource[]
  }

  // For each external place, find nearest fridge
  const placesWithNearest = externalPlaces.map((place: ExternalPlaceWithSource) => {
    if (!place.lat || !place.lng || !fridges || fridges.length === 0) {
      return place as ExternalPlaceWithSource
    }

    let nearestFridge = null
    let minDistance = Infinity

    for (const fridge of fridges) {
      const distance = haversineMeters(
        { lat: place.lat, lng: place.lng },
        { lat: fridge.lat, lng: fridge.lng }
      )

      if (distance < minDistance) {
        minDistance = distance
        const similarity = stringSimilarity(place.name || '', fridge.name)
        nearestFridge = {
          id: fridge.id,
          name: fridge.name,
          distance,
          similarity,
        }
      }
    }

    return {
      ...place,
      nearestFridge: nearestFridge || undefined,
    } as ExternalPlaceWithSource & {
      nearestFridge?: {
        id: string
        name: string
        distance: number
        similarity: number
      }
    }
  })

  return placesWithNearest
}

/**
 * Create a new fridge from an external place
 */
export async function createFridgeFromImport(
  externalPlaceId: string,
  data?: {
    name?: string
    description?: string
    address?: string
  }
): Promise<{ success: boolean; fridgeId?: string; error?: string }> {
  const supabase = await createClient()

  // Check user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Not authorized' }
  }

  // Get the external place
  const { data: externalPlace, error: placeError } = await supabase
    .from('external_place')
    .select('*')
    .eq('id', externalPlaceId)
    .single()

  if (placeError || !externalPlace) {
    return { success: false, error: 'External place not found' }
  }

  if (!externalPlace.lat || !externalPlace.lng) {
    return { success: false, error: 'External place missing coordinates' }
  }

  // Create the fridge
  const { data: newFridge, error: fridgeError } = await supabase
    .from('fridge')
    .insert({
      name: data?.name || externalPlace.name || 'Community Fridge',
      description: data?.description || null,
      address: data?.address || externalPlace.address || null,
      lat: externalPlace.lat,
      lng: externalPlace.lng,
      is_active: true,
      external_place_id: externalPlaceId,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (fridgeError || !newFridge) {
    return { success: false, error: fridgeError?.message || 'Failed to create fridge' }
  }

  revalidatePath('/admin/imports')
  revalidatePath('/')
  revalidatePath('/admin/fridges')

  return { success: true, fridgeId: newFridge.id }
}

/**
 * Link an existing fridge to an external place
 */
export async function mergeFridgeWithImport(
  fridgeId: string,
  externalPlaceId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Check user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Not authorized' }
  }

  // Update the fridge
  const { error: updateError } = await supabase
    .from('fridge')
    .update({ external_place_id: externalPlaceId })
    .eq('id', fridgeId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/admin/imports')
  revalidatePath('/')
  revalidatePath('/admin/fridges')
  revalidatePath(`/fridge/${fridgeId}`)

  return { success: true }
}

/**
 * Mark an external place as ignored
 */
export async function ignoreImport(
  externalPlaceId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Check user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Not authorized' }
  }

  // Mark as ignored
  const { error: updateError } = await supabase
    .from('external_place')
    .update({ ignored: true })
    .eq('id', externalPlaceId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/admin/imports')

  return { success: true }
}

/**
 * Get all fridges for merge dropdown
 */
export async function getAllFridges(): Promise<Fridge[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fridge')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching fridges:', error)
    return []
  }

  return data || []
}

