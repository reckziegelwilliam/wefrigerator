import { z } from 'zod'

// Status enums
export const FridgeStatus = z.enum(['open', 'stocked', 'needs', 'closed'])
export const RequestStatus = z.enum(['open', 'fulfilled', 'withdrawn'])
export const RouteAssignmentStatus = z.enum(['claimed', 'completed', 'missed'])
export const UserRole = z.enum(['visitor', 'contributor', 'volunteer', 'admin'])
export const PickupWindowType = z.enum(['pickup', 'dropoff'])

// Fridge schemas
export const FridgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  is_active: z.boolean().default(true),
  accessibility: z.object({
    '24_7': z.boolean().optional(),
    wheelchair: z.boolean().optional(),
  }).optional(),
  created_by: z.string().uuid().optional().nullable(),
  created_at: z.string().optional(),
})

export const CreateFridgeSchema = FridgeSchema.omit({ id: true, created_at: true })

// Status update schema
export const StatusUpdateSchema = z.object({
  fridgeId: z.string().uuid(),
  status: FridgeStatus,
  note: z.string().max(500).optional(),
  photo: z
    .custom<File>()
    .refine((file) => !file || file.size <= 3 * 1024 * 1024, 'Photo must be less than 3MB')
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Photo must be JPEG, PNG, or WebP'
    )
    .optional(),
})

// Inventory schema
export const InventorySchema = z.object({
  fridgeId: z.string().uuid(),
  produce: z.boolean().default(false),
  canned: z.boolean().default(false),
  grains: z.boolean().default(false),
  dairy: z.boolean().default(false),
  baby: z.boolean().default(false),
  hygiene: z.boolean().default(false),
  water: z.boolean().default(false),
})

// Item request schema
export const ItemRequestSchema = z.object({
  fridgeId: z.string().uuid(),
  category: z.string().min(1, 'Category is required'),
  detail: z.string().max(120).optional(),
})

export const UpdateItemRequestSchema = z.object({
  id: z.string().uuid(),
  status: RequestStatus,
})

// Route schemas
export const RouteSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Route name is required'),
  description: z.string().optional(),
  created_by: z.string().uuid().optional().nullable(),
  created_at: z.string().optional(),
})

export const CreateRouteSchema = RouteSchema.omit({ id: true, created_at: true })

export const RouteAssignmentSchema = z.object({
  routeId: z.string().uuid(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
})

export const RouteCheckSchema = z.object({
  routeAssignmentId: z.string().uuid(),
  fridgeId: z.string().uuid(),
  condition: z.string().min(1, 'Condition is required'),
  note: z.string().max(500).optional(),
})

// Profile schema
export const ProfileSchema = z.object({
  user_id: z.string().uuid(),
  display_name: z.string().min(1, 'Display name is required').max(100),
  phone: z.string().optional(),
  role: UserRole.default('contributor'),
})

export const UpdateProfileSchema = ProfileSchema.omit({ user_id: true })

// Pickup window schema
export const PickupWindowSchema = z.object({
  fridgeId: z.string().uuid(),
  starts_at: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  ends_at: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  type: PickupWindowType.default('pickup'),
  capacity: z.number().int().positive().optional(),
})

// Type exports - Form/validation types inferred from Zod schemas
export type FridgeFormType = z.infer<typeof FridgeSchema>
export type CreateFridgeFormType = z.infer<typeof CreateFridgeSchema>
export type StatusUpdateFormType = z.infer<typeof StatusUpdateSchema>
export type InventoryFormType = z.infer<typeof InventorySchema>
export type ItemRequestFormType = z.infer<typeof ItemRequestSchema>
export type RouteFormType = z.infer<typeof RouteSchema>
export type CreateRouteFormType = z.infer<typeof CreateRouteSchema>
export type RouteAssignmentFormType = z.infer<typeof RouteAssignmentSchema>
export type RouteCheckFormType = z.infer<typeof RouteCheckSchema>
export type ProfileFormType = z.infer<typeof ProfileSchema>
export type UpdateProfileFormType = z.infer<typeof UpdateProfileSchema>
export type PickupWindowFormType = z.infer<typeof PickupWindowSchema>

