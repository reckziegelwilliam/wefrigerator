// Database types and extended types

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          user_id: string
          display_name: string | null
          phone: string | null
          role: 'visitor' | 'contributor' | 'volunteer' | 'admin'
          created_at: string
        }
        Insert: {
          user_id: string
          display_name?: string | null
          phone?: string | null
          role?: 'visitor' | 'contributor' | 'volunteer' | 'admin'
          created_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string | null
          phone?: string | null
          role?: 'visitor' | 'contributor' | 'volunteer' | 'admin'
          created_at?: string
        }
      }
      fridge: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
      lat: number
      lng: number
      is_active: boolean
      accessibility: Record<string, boolean> | null
      created_by: string | null
          created_at: string
        }
      }
      fridge_status: {
        Row: {
          id: string
          fridge_id: string
          status: 'open' | 'stocked' | 'needs' | 'closed'
          note: string | null
          photo_path: string | null
          created_by: string | null
          created_at: string
        }
      }
      fridge_inventory: {
        Row: {
          fridge_id: string
          produce: boolean
          canned: boolean
          grains: boolean
          dairy: boolean
          baby: boolean
          hygiene: boolean
          water: boolean
          last_updated_by: string | null
          updated_at: string
        }
      }
      item_request: {
        Row: {
          id: string
          fridge_id: string
          category: string | null
          detail: string | null
          status: 'open' | 'fulfilled' | 'withdrawn'
          created_by: string | null
          created_at: string
          fulfilled_at: string | null
        }
      }
      pickup_window: {
        Row: {
          id: string
          fridge_id: string
          starts_at: string
          ends_at: string
          type: 'pickup' | 'dropoff'
          capacity: number | null
          created_by: string | null
          created_at: string
        }
      }
      route: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          created_at: string
        }
      }
      route_fridge: {
        Row: {
          route_id: string
          fridge_id: string
          sort_order: number
        }
      }
      route_assignment: {
        Row: {
          id: string
          route_id: string
          date: string
          volunteer_id: string | null
          status: 'claimed' | 'completed' | 'missed'
          created_at: string
        }
      }
      route_check: {
        Row: {
          id: string
          route_assignment_id: string
          fridge_id: string
          arrived_at: string
          condition: string | null
          note: string | null
        }
      }
    }
  }
}

// Convenience type aliases for commonly used table rows
export type Profile = Database['public']['Tables']['profile']['Row']
export type Fridge = Database['public']['Tables']['fridge']['Row']
export type FridgeStatus = Database['public']['Tables']['fridge_status']['Row']
export type FridgeInventory = Database['public']['Tables']['fridge_inventory']['Row']
export type ItemRequest = Database['public']['Tables']['item_request']['Row']
export type PickupWindow = Database['public']['Tables']['pickup_window']['Row']
export type Route = Database['public']['Tables']['route']['Row']
export type RouteFridge = Database['public']['Tables']['route_fridge']['Row']
export type RouteAssignment = Database['public']['Tables']['route_assignment']['Row']
export type RouteCheck = Database['public']['Tables']['route_check']['Row']

// Common union types
export type StatusType = 'open' | 'stocked' | 'needs' | 'closed'
export type UserRoleType = 'visitor' | 'contributor' | 'volunteer' | 'admin'
export type RequestStatusType = 'open' | 'fulfilled' | 'withdrawn'

// Extended types with joined data
export type FridgeWithStatus = Fridge & {
  latest_status?: FridgeStatus
  inventory?: FridgeInventory
  open_requests_count?: number
}

export type RouteWithFridges = Route & {
  fridges?: (Fridge & {
    sort_order: number
  })[]
}

export type RouteAssignmentWithDetails = RouteAssignment & {
  route?: RouteWithFridges
  volunteer?: Profile
}

// Specialized query result types
export type NeedyFridge = {
  id: string
  name: string
  fridge_status: {
    status: string
    created_at: string
  }[]
}

