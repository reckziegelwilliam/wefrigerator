'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createItemRequest } from '@/app/actions/requests'
import { toast } from 'sonner'

const formSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  detail: z.string().max(120).optional(),
})

type FormValues = z.infer<typeof formSchema>

const categories = [
  { value: 'water', label: 'Water' },
  { value: 'produce', label: 'Produce' },
  { value: 'canned', label: 'Canned Goods' },
  { value: 'grains', label: 'Grains' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'baby', label: 'Baby Items' },
  { value: 'hygiene', label: 'Hygiene Products' },
  { value: 'other', label: 'Other' },
]

interface RequestFormProps {
  fridgeId: string
}

export function RequestForm({ fridgeId }: RequestFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      detail: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)

    try {
      const result = await createItemRequest(fridgeId, values.category, values.detail)

      if (result.success) {
        toast.success('Request submitted successfully!')
        router.push(`/fridge/${fridgeId}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to submit request')
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
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="detail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Size 4 diapers, lactose-free milk, etc."
                  className="resize-none"
                  {...field}
                  maxLength={120}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/120 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

