import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { FridgeInventory } from '@/lib/types'

interface InventoryChipsProps {
  inventory: FridgeInventory | null | undefined
  showAll?: boolean
}

const categoryLabels: Record<keyof Omit<FridgeInventory, 'fridge_id' | 'last_updated_by' | 'updated_at'>, string> = {
  produce: 'Produce',
  canned: 'Canned Goods',
  grains: 'Grains',
  dairy: 'Dairy',
  baby: 'Baby Items',
  hygiene: 'Hygiene',
  water: 'Water',
}

export function InventoryChips({ inventory, showAll = false }: InventoryChipsProps) {
  if (!inventory) {
    return <p className="text-sm text-gray-500">No inventory data available</p>
  }

  const categories = Object.entries(categoryLabels).map(([key, label]) => ({
    key: key as keyof typeof categoryLabels,
    label,
    available: inventory[key as keyof typeof categoryLabels],
  }))

  // Filter to show only available items unless showAll is true
  const displayCategories = showAll ? categories : categories.filter(cat => cat.available)

  if (displayCategories.length === 0 && !showAll) {
    return <p className="text-sm text-gray-500">No items currently available</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayCategories.map(({ key, label, available }) => (
        <Badge
          key={key}
          variant={available ? 'default' : 'secondary'}
          className={available ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600'}
        >
          {available ? (
            <Check className="w-3 h-3 mr-1" aria-hidden="true" />
          ) : (
            <X className="w-3 h-3 mr-1" aria-hidden="true" />
          )}
          {label}
        </Badge>
      ))}
    </div>
  )
}

