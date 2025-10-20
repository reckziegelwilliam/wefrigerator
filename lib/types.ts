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
      external_source: {
        Row: {
          id: string
          name: string
          attribution: string | null
          license: string | null
          attribution_url: string | null
          meta: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          attribution?: string | null
          license?: string | null
          attribution_url?: string | null
          meta?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          attribution?: string | null
          license?: string | null
          attribution_url?: string | null
          meta?: Record<string, unknown> | null
          created_at?: string
        }
      }
      external_place: {
        Row: {
          id: string
          source_id: string
          source_place_id: string | null
          name: string | null
          address: string | null
          lat: number | null
          lng: number | null
          raw: Record<string, unknown> | null
          last_seen_at: string | null
          created_at: string
          ignored: boolean
        }
        Insert: {
          id?: string
          source_id: string
          source_place_id?: string | null
          name?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          raw?: Record<string, unknown> | null
          last_seen_at?: string | null
          created_at?: string
          ignored?: boolean
        }
        Update: {
          id?: string
          source_id?: string
          source_place_id?: string | null
          name?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          raw?: Record<string, unknown> | null
          last_seen_at?: string | null
          created_at?: string
          ignored?: boolean
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
          external_place_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          lat: number
          lng: number
          is_active?: boolean
          accessibility?: Record<string, boolean> | null
          created_by?: string | null
          created_at?: string
          external_place_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          lat?: number
          lng?: number
          is_active?: boolean
          accessibility?: Record<string, boolean> | null
          created_by?: string | null
          created_at?: string
          external_place_id?: string | null
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
export type ExternalSource = Database['public']['Tables']['external_source']['Row']
export type ExternalPlace = Database['public']['Tables']['external_place']['Row']
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

export type ExternalPlaceWithSource = ExternalPlace & {
  source?: ExternalSource
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

// ========================================
// LA Food Assistance Data Types
// ========================================

// Enums and literal types
export type LASiteType = 
  | 'community_fridge'
  | 'food_pantry'
  | 'food_bank'
  | 'soup_kitchen'
  | 'senior_meals'
  | 'shelter'
  | 'multi_service'
  | 'church_program'
  | 'gov_center'
  | 'youth_center'

export type LAServiceTag =
  | 'community_fridge'
  | 'mutual_aid'
  | 'free_store'
  | 'food_pantry'
  | 'food_bank_wholesale'
  | 'congregate_meal'
  | 'home_delivered_meal'
  | 'holiday_meal'
  | 'shelter'
  | 'utility_aid'
  | 'counseling'
  | 'employment'
  | 'immigration'
  | 'youth_programs'
  | 'senior_services'
  | 'health_clinic'

export type LAPopulationTag =
  | 'seniors_60_plus'
  | 'families_with_children'
  | 'homeless'
  | 'hiv_aids'
  | 'undocumented'
  | 'zip_restricted'
  | 'youth'
  | 'veterans'
  | 'access_permissive'

export type LAAccessModel =
  | 'walk_in'
  | 'appointment'
  | 'scheduled_days'
  | 'twenty_four_seven'

export type LAOrgType =
  | 'faith_based'
  | 'nonprofit'
  | 'government'
  | 'collective'

export type LAFreshnessBucket =
  | '<12mo'
  | '12_24mo'
  | '>24mo'

// Structured data types
export type LAAddress = {
  street1: string | null
  street2: string | null
  city: string | null
  state: string | null
  zip: string | null
}

export type LALocation = {
  lat: number
  lon: number
}

export type LAPhone = {
  label: string | null
  number: string
  ext: string | null
}

export type LAHours = {
  days: string
  opens: string | null
  closes: string | null
  notes: string | null
  parsed: boolean
}

export type LAFlags = {
  flag_address_geo_mismatch: boolean
  flag_unparseable_hours: boolean
  flag_broken_url: boolean
  flag_stale_record: boolean
  flag_sparse_record: boolean
}

export type LARawData = {
  OBJECTID: number
  link?: string | null
  [key: string]: unknown
}

// Main site record (flat)
export type LASite = {
  site_id: string
  post_id: number | null
  name: string
  org_root_name: string | null
  org_type: LAOrgType | null
  site_type: LASiteType | null
  service_tags: LAServiceTag[]
  population_tags: LAPopulationTag[]
  access_model: LAAccessModel | null
  description: string | null
  address: LAAddress
  location: LALocation
  hours: LAHours[]
  phones: LAPhone[]
  website: string | null
  website_domain: string | null
  email: string | null
  source: string
  updated_at: string | null
  freshness_bucket: LAFreshnessBucket | null
  distance_m: number | null
  score_recency: number
  score_open_now: number
  score_specificity: number
  score_population_fit: number
  flags: LAFlags
  raw: LARawData
}

// Simplified site for org cluster view
export type LAClusteredSite = {
  site_id: string
  name: string
  site_type: LASiteType | null
  address: LAAddress
  location: LALocation
  service_tags: LAServiceTag[]
  population_tags: LAPopulationTag[]
}

// Organization cluster
export type LAOrgCluster = {
  org_root_name: string
  org_type: LAOrgType | null
  website: string | null
  website_domain: string | null
  sites: LAClusteredSite[]
}

// ========================================
// OSM (OpenStreetMap) Data Types
// ========================================

// OSM element types
export type OSMElementType = 'node' | 'way' | 'relation'

// OSM tags (free-form key-value pairs)
export type OSMTags = {
  name?: string
  amenity?: string
  operator?: string
  description?: string
  note?: string
  website?: string
  'contact:website'?: string
  url?: string
  'contact:instagram'?: string
  phone?: string
  'contact:phone'?: string
  'contact:mobile'?: string
  email?: string
  'contact:email'?: string
  opening_hours?: string
  access?: string
  image?: string
  'addr:housenumber'?: string
  'addr:street'?: string
  'addr:unit'?: string
  'addr:city'?: string
  'addr:state'?: string
  'addr:postcode'?: string
  [key: string]: string | undefined
}

// OSM element from Overpass API
export type OSMElement = {
  type: OSMElementType
  id: number
  lat?: number
  lon?: number
  center?: {
    lat: number
    lon: number
  }
  tags?: OSMTags
  version?: number
  timestamp?: string
  changeset?: number
  user?: string
  uid?: number
}

// OSM source metadata for provenance tracking
export type OSMSourceMeta = {
  provider: 'OpenStreetMap'
  endpoint: 'Overpass API'
  endpoint_query: string
  osm_type: OSMElementType
  osm_id: number
  osm_version?: number
  osm_timestamp?: string
  last_seen_at: string
  raw_hash: string
}

