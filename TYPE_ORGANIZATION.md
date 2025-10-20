# Type Organization Guide

All types are now cleanly organized in centralized files for easy maintenance and reuse.

## 📁 Type File Structure

### `lib/types.ts` - **Database & Domain Types**
> The single source of truth for all database types and domain models

#### 1. Database Type Definition
Complete Supabase database schema with all 10 tables:
- `Database.public.Tables.profile`
- `Database.public.Tables.fridge`
- `Database.public.Tables.fridge_status`
- `Database.public.Tables.fridge_inventory`
- `Database.public.Tables.item_request`
- `Database.public.Tables.pickup_window`
- `Database.public.Tables.route`
- `Database.public.Tables.route_fridge`
- `Database.public.Tables.route_assignment`
- `Database.public.Tables.route_check`

Each table includes:
- `Row` - Full table row type
- `Insert` - Type for inserting (optional fields)
- `Update` - Type for updating (all optional)

#### 2. Convenience Type Aliases
Short, reusable aliases for common table types:

```typescript
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
```

#### 3. Common Union Types
Reusable status/enum types:

```typescript
export type StatusType = 'open' | 'stocked' | 'needs' | 'closed'
export type UserRoleType = 'visitor' | 'contributor' | 'volunteer' | 'admin'
export type RequestStatusType = 'open' | 'fulfilled' | 'withdrawn'
```

#### 4. Extended Types with Joined Data
Complex types for queries with relationships:

```typescript
export type FridgeWithStatus = Fridge & {
  latest_status?: FridgeStatus
  inventory?: FridgeInventory
  open_requests_count?: number
}

export type RouteWithFridges = Route & {
  fridges?: (Fridge & { sort_order: number })[]
}

export type RouteAssignmentWithDetails = RouteAssignment & {
  route?: RouteWithFridges
  volunteer?: Profile
}
```

#### 5. Specialized Query Result Types
Types for specific complex queries:

```typescript
export type NeedyFridge = {
  id: string
  name: string
  fridge_status: {
    status: string
    created_at: string
  }[]
}
```

---

### `lib/validators.ts` - **Validation Schemas & Form Types**
> Zod schemas for form validation and their inferred types

#### 1. Zod Enum Schemas
```typescript
export const FridgeStatus = z.enum(['open', 'stocked', 'needs', 'closed'])
export const RequestStatus = z.enum(['open', 'fulfilled', 'withdrawn'])
export const RouteAssignmentStatus = z.enum(['claimed', 'completed', 'missed'])
export const UserRole = z.enum(['visitor', 'contributor', 'volunteer', 'admin'])
export const PickupWindowType = z.enum(['pickup', 'dropoff'])
```

#### 2. Entity Validation Schemas
Complete validation schemas for forms:
- `FridgeSchema` / `CreateFridgeSchema`
- `StatusUpdateSchema`
- `InventorySchema`
- `ItemRequestSchema` / `UpdateItemRequestSchema`
- `RouteSchema` / `CreateRouteSchema`
- `RouteAssignmentSchema`
- `RouteCheckSchema`
- `ProfileSchema` / `UpdateProfileSchema`
- `PickupWindowSchema`

#### 3. Inferred Form Types
TypeScript types derived from Zod schemas (for form handling):

```typescript
export type FridgeFormType = z.infer<typeof FridgeSchema>
export type StatusUpdateFormType = z.infer<typeof StatusUpdateSchema>
export type ItemRequestFormType = z.infer<typeof ItemRequestSchema>
// ... etc
```

---

### Component Props Interfaces
> Each component defines its own props interface locally (best practice)

**Pattern:**
```typescript
// In component file
interface ComponentNameProps {
  // props specific to this component
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // component implementation
}
```

**Examples:**
- `FridgeCardProps` in `FridgeCard.tsx`
- `StatusTimelineProps` in `StatusTimeline.tsx`
- `UpdateFormProps` in `UpdateForm.tsx`

---

## 🎯 Type Usage Guide

### When Building a Component

**Import database types from `lib/types.ts`:**
```typescript
import { Fridge, FridgeStatus, ItemRequest } from '@/lib/types'
```

**Import validation schemas from `lib/validators.ts`:**
```typescript
import { StatusUpdateSchema, ItemRequestSchema } from '@/lib/validators'
```

**Define component-specific props locally:**
```typescript
interface MyComponentProps {
  fridge: Fridge
  onUpdate: () => void
}
```

### When Building a Form

**Use Zod schema for validation:**
```typescript
import { StatusUpdateSchema } from '@/lib/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(StatusUpdateSchema),
})
```

### When Working with Server Actions

**Import database types:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { Fridge, FridgeStatus } from '@/lib/types'

export async function getFridge(id: string): Promise<Fridge | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fridge')
    .select('*')
    .eq('id', id)
    .single()
  
  return data
}
```

---

## 📊 Type Import Map

### By File

| File | Imports From |
|------|--------------|
| **Components** | `lib/types.ts` (database types) |
| **Forms** | `lib/validators.ts` (Zod schemas) + `lib/types.ts` |
| **Server Actions** | `lib/types.ts` (database types) |
| **Pages** | `lib/types.ts` (database types) |
| **Utilities** | `lib/types.ts` as needed |

### By Use Case

| Use Case | Import |
|----------|--------|
| Display data | `lib/types.ts` → `Fridge`, `FridgeStatus`, etc. |
| Form validation | `lib/validators.ts` → Zod schemas |
| Form types | `lib/validators.ts` → `*FormType` exports |
| Status/Role values | `lib/types.ts` → `StatusType`, `UserRoleType` |
| Complex queries | `lib/types.ts` → `FridgeWithStatus`, etc. |

---

## ✅ Organization Benefits

### Before Cleanup
- ❌ Types scattered across 20+ files
- ❌ Duplicate type definitions
- ❌ Naming conflicts
- ❌ Hard to find types
- ❌ Inconsistent usage

### After Cleanup
- ✅ All database types in `lib/types.ts`
- ✅ All validation types in `lib/validators.ts`
- ✅ No duplicate definitions
- ✅ Clear naming conventions
- ✅ Easy to import and use
- ✅ Single source of truth

---

## 🔍 Quick Reference

### Most Commonly Used Types

**For Components:**
```typescript
import { 
  Fridge,
  FridgeStatus,
  FridgeInventory,
  ItemRequest,
  Profile,
  StatusType,
  UserRoleType,
  FridgeWithStatus 
} from '@/lib/types'
```

**For Forms:**
```typescript
import {
  StatusUpdateSchema,
  ItemRequestSchema,
  ProfileSchema
} from '@/lib/validators'
```

**For Server Actions:**
```typescript
import { 
  Fridge,
  Route,
  RouteAssignment,
  NeedyFridge 
} from '@/lib/types'
```

---

## 📝 Naming Conventions

### Database Types (lib/types.ts)
- **Table row types:** PascalCase singular (e.g., `Fridge`, `FridgeStatus`)
- **Extended types:** Descriptive compound (e.g., `FridgeWithStatus`)
- **Union types:** Descriptive + "Type" suffix (e.g., `StatusType`, `UserRoleType`)
- **Query results:** Descriptive adjective + Entity (e.g., `NeedyFridge`)

### Validation Types (lib/validators.ts)
- **Zod schemas:** PascalCase + "Schema" suffix (e.g., `FridgeSchema`)
- **Inferred types:** PascalCase + "FormType" suffix (e.g., `FridgeFormType`)
- **Zod enums:** PascalCase (e.g., `FridgeStatus`, `UserRole`)

### Component Props
- **Props interfaces:** ComponentName + "Props" suffix (e.g., `FridgeCardProps`)
- **Local state types:** Descriptive names (e.g., `CheckData` in RouteStepper)

---

## 🔧 Maintenance

### Adding a New Table

1. **Update `lib/types.ts`:**
   - Add table to `Database.public.Tables`
   - Add convenience type alias
   - Add extended types if needed

2. **Update `lib/validators.ts`:**
   - Add Zod schema for validation
   - Export inferred form type

### Modifying Existing Types

1. **Database changes:** Update `lib/types.ts` → Run type-check
2. **Validation changes:** Update `lib/validators.ts` → Run type-check
3. **Test thoroughly:** Components using changed types will show errors

### Finding Type Definitions

**Quick search:**
```bash
# Find where a type is defined
grep -r "export type FridgeName" lib/

# Find where a type is used
grep -r "import.*FridgeName" .
```

---

## ✨ Type Safety Best Practices

1. **Always import from centralized files** - Don't redefine types
2. **Use convenience aliases** - `Fridge` not `Database['public']['Tables']['fridge']['Row']`
3. **Leverage TypeScript inference** - Let TS infer when possible
4. **Avoid `any`** - Use proper types or `unknown` when truly unknown
5. **Document complex types** - Add JSDoc comments for clarity

---

## 📚 Complete Type Index

### From `lib/types.ts`

**Base Types:**
- Profile, Fridge, FridgeStatus, FridgeInventory
- ItemRequest, PickupWindow
- Route, RouteFridge, RouteAssignment, RouteCheck

**Union Types:**
- StatusType, UserRoleType, RequestStatusType

**Extended Types:**
- FridgeWithStatus, RouteWithFridges, RouteAssignmentWithDetails

**Query Types:**
- NeedyFridge

### From `lib/validators.ts`

**Zod Schemas:**
- FridgeSchema, StatusUpdateSchema, InventorySchema
- ItemRequestSchema, RouteSchema, RouteAssignmentSchema
- RouteCheckSchema, ProfileSchema, PickupWindowSchema

**Form Types:**
- FridgeFormType, StatusUpdateFormType, ItemRequestFormType
- RouteFormType, ProfileFormType, PickupWindowFormType

---

**Last Updated:** 2025-10-20
**Status:** ✅ FULLY ORGANIZED
**TypeScript:** ✅ PASSING

