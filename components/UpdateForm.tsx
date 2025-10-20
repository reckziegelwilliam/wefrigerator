'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PhotoUploader } from './PhotoUploader'
import { postStatus } from '@/app/actions/status'
import { toast } from 'sonner'

const formSchema = z.object({
  status: z.enum(['open', 'stocked', 'needs', 'closed']),
  note: z.string().max(500).optional(),
  photo: z.custom<File>().optional(),
  produce: z.boolean(),
  canned: z.boolean(),
  grains: z.boolean(),
  dairy: z.boolean(),
  baby: z.boolean(),
  hygiene: z.boolean(),
  water: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface UpdateFormProps {
  fridgeId: string
  currentInventory?: {
    produce: boolean
    canned: boolean
    grains: boolean
    dairy: boolean
    baby: boolean
    hygiene: boolean
    water: boolean
  }
}

export function UpdateForm({ fridgeId, currentInventory }: UpdateFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'open',
      note: '',
      produce: currentInventory?.produce || false,
      canned: currentInventory?.canned || false,
      grains: currentInventory?.grains || false,
      dairy: currentInventory?.dairy || false,
      baby: currentInventory?.baby || false,
      hygiene: currentInventory?.hygiene || false,
      water: currentInventory?.water || false,
    },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('fridgeId', fridgeId)
      formData.append('status', values.status)
      if (values.note) formData.append('note', values.note)
      if (selectedPhoto) formData.append('photo', selectedPhoto)

      // Append inventory data
      formData.append('produce', values.produce.toString())
      formData.append('canned', values.canned.toString())
      formData.append('grains', values.grains.toString())
      formData.append('dairy', values.dairy.toString())
      formData.append('baby', values.baby.toString())
      formData.append('hygiene', values.hygiene.toString())
      formData.append('water', values.water.toString())

      const result = await postStatus(formData)

      if (result.success) {
        toast.success('Status updated successfully!')
        router.push(`/fridge/${fridgeId}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Selection */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="open" id="open" />
                    <label htmlFor="open" className="cursor-pointer flex-1">
                      <div className="font-medium">Open</div>
                      <div className="text-sm text-gray-500">Accessible now</div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="stocked" id="stocked" />
                    <label htmlFor="stocked" className="cursor-pointer flex-1">
                      <div className="font-medium">Stocked</div>
                      <div className="text-sm text-gray-500">Recently restocked</div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="needs" id="needs" />
                    <label htmlFor="needs" className="cursor-pointer flex-1">
                      <div className="font-medium">Needs Items</div>
                      <div className="text-sm text-gray-500">Low on supplies</div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="closed" id="closed" />
                    <label htmlFor="closed" className="cursor-pointer flex-1">
                      <div className="font-medium">Closed</div>
                      <div className="text-sm text-gray-500">Unavailable</div>
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any details about the current state..."
                  className="resize-none"
                  {...field}
                  maxLength={500}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo Upload */}
        <div>
          <FormLabel>Photo (optional)</FormLabel>
          <PhotoUploader onPhotoSelect={setSelectedPhoto} />
        </div>

        {/* Inventory */}
          <div className="space-y-3">
          <FormLabel>What&apos;s Available? (check all that apply)</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'produce', label: 'Produce' },
              { name: 'canned', label: 'Canned Goods' },
              { name: 'grains', label: 'Grains' },
              { name: 'dairy', label: 'Dairy' },
              { name: 'baby', label: 'Baby Items' },
              { name: 'hygiene', label: 'Hygiene' },
              { name: 'water', label: 'Water' },
            ].map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name as 'produce' | 'canned' | 'grains' | 'dairy' | 'baby' | 'hygiene' | 'water'}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 border rounded-lg p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      {item.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? 'Posting...' : 'Post Update'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

