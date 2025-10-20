'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { validateImageFile, stripExif, resizeImage } from '@/lib/utils/image'
import { Upload, X } from 'lucide-react'

interface PhotoUploaderProps {
  onPhotoSelect: (file: File | null) => void
}

export function PhotoUploader({ onPhotoSelect }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setError(null)
    setProcessing(true)

    try {
      // Strip EXIF and resize
      const processedFile = await stripExif(file)
      const resizedFile = await resizeImage(processedFile)
      
      // Create preview
      const previewUrl = URL.createObjectURL(resizedFile)
      setPreview(previewUrl)
      
      onPhotoSelect(resizedFile)
    } catch (err) {
      setError('Failed to process image')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onPhotoSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="photo-upload"
        aria-label="Upload photo"
      />
      
      {!preview ? (
        <label
          htmlFor="photo-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {processing ? (
              <div className="text-sm text-gray-500">Processing...</div>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click to upload photo (max 3MB)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, or WebP
                </p>
              </>
            )}
          </div>
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

