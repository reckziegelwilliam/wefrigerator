'use client'

import { useState } from 'react'
import { ExternalPlaceWithSource } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createFridgeFromImport,
  mergeFridgeWithImport,
  ignoreImport,
  getAllFridges,
} from '@/app/actions/imports'
import { formatDistance } from '@/lib/utils/geo'
import { toast } from 'sonner'
import { Fridge } from '@/lib/types'

interface ImportsListProps {
  places: (ExternalPlaceWithSource & {
    nearestFridge?: {
      id: string
      name: string
      distance: number
      similarity: number
    }
  })[]
}

const sourceColors = {
  osm_overpass: 'bg-blue-500',
  lac_charitable_food: 'bg-green-500',
  freedge: 'bg-purple-500',
}

export function ImportsList({ places }: ImportsListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<
    (typeof places)[0] | null
  >(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
  })
  const [selectedFridgeId, setSelectedFridgeId] = useState<string>('')
  const [fridges, setFridges] = useState<Fridge[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const handleCreateClick = (place: (typeof places)[0]) => {
    setSelectedPlace(place)
    setFormData({
      name: place.name || '',
      description: '',
      address: place.address || '',
    })
    setCreateDialogOpen(true)
  }

  const handleMergeClick = async (place: (typeof places)[0]) => {
    setSelectedPlace(place)
    setLoading(true)
    const allFridges = await getAllFridges()
    setFridges(allFridges)
    setLoading(false)
    
    // Pre-select nearest fridge if available
    if (place.nearestFridge) {
      setSelectedFridgeId(place.nearestFridge.id)
    }
    
    setMergeDialogOpen(true)
  }

  const handleCreateSubmit = async () => {
    if (!selectedPlace) return

    setLoading(true)
    const result = await createFridgeFromImport(selectedPlace.id, formData)
    setLoading(false)

    if (result.success) {
      toast.success('Fridge created successfully')
      setCreateDialogOpen(false)
      window.location.reload()
    } else {
      toast.error(result.error || 'Failed to create fridge')
    }
  }

  const handleMergeSubmit = async () => {
    if (!selectedPlace || !selectedFridgeId) return

    setLoading(true)
    const result = await mergeFridgeWithImport(selectedFridgeId, selectedPlace.id)
    setLoading(false)

    if (result.success) {
      toast.success('Fridge merged successfully')
      setMergeDialogOpen(false)
      window.location.reload()
    } else {
      toast.error(result.error || 'Failed to merge fridge')
    }
  }

  const handleIgnore = async (placeId: string) => {
    if (!confirm('Are you sure you want to ignore this import?')) return

    setLoading(true)
    const result = await ignoreImport(placeId)
    setLoading(false)

    if (result.success) {
      toast.success('Import ignored')
      window.location.reload()
    } else {
      toast.error(result.error || 'Failed to ignore import')
    }
  }

  const filteredPlaces =
    filter === 'all'
      ? places
      : places.filter((p) => p.source?.name === filter)

  if (places.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No unlinked external places found. Run the ingestion APIs to import data.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="osm_overpass">OSM Overpass</SelectItem>
            <SelectItem value="lac_charitable_food">LA County</SelectItem>
            <SelectItem value="freedge">Freedge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredPlaces.map((place) => (
          <Card key={place.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{place.name}</CardTitle>
                    {place.source && (
                      <Badge
                        className={`${
                          sourceColors[
                            place.source.name as keyof typeof sourceColors
                          ] || 'bg-gray-500'
                        } text-white`}
                      >
                        {place.source.name === 'osm_overpass'
                          ? 'OSM'
                          : place.source.name === 'lac_charitable_food'
                            ? 'LA County'
                            : 'Freedge'}
                      </Badge>
                    )}
                  </div>
                  {place.address && (
                    <p className="text-sm text-muted-foreground">
                      {place.address}
                    </p>
                  )}
                  {place.lat && place.lng && (
                    <p className="text-xs text-muted-foreground">
                      {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleCreateClick(place)}
                    disabled={loading}
                  >
                    Create Fridge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMergeClick(place)}
                    disabled={loading}
                  >
                    Merge
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleIgnore(place.id)}
                    disabled={loading}
                  >
                    Ignore
                  </Button>
                </div>
              </div>
            </CardHeader>
            {place.nearestFridge && (
              <CardContent>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">
                    Nearest existing fridge:
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {place.nearestFridge.name}
                    </span>
                    <Badge variant="outline">
                      {formatDistance(place.nearestFridge.distance)}
                    </Badge>
                    {place.nearestFridge.similarity > 0.5 && (
                      <Badge variant="outline" className="bg-yellow-50">
                        {Math.round(place.nearestFridge.similarity * 100)}%
                        similar
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Fridge from Import</DialogTitle>
            <DialogDescription>
              Create a new fridge from this external data source. You can edit
              the details before creating.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Fridge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge with Existing Fridge</DialogTitle>
            <DialogDescription>
              Link this external place to an existing fridge in the database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fridge">Select Fridge</Label>
              <Select value={selectedFridgeId} onValueChange={setSelectedFridgeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a fridge" />
                </SelectTrigger>
                <SelectContent>
                  {fridges.map((fridge) => (
                    <SelectItem key={fridge.id} value={fridge.id}>
                      {fridge.name}
                      {fridge.address && ` - ${fridge.address}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMergeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMergeSubmit}
              disabled={loading || !selectedFridgeId}
            >
              {loading ? 'Merging...' : 'Merge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

