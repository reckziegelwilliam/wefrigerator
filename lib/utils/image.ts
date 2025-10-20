// EXIF stripping and image validation utilities

export async function stripExif(file: File): Promise<File> {
  // For a production app, you'd want to use a library like piexifjs
  // For now, we'll create a new file by drawing to canvas which strips EXIF
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create blob'))
          return
        }
        
        const newFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        })
        
        resolve(newFile)
      }, file.type)
    }
    
    img.onerror = () => {
      reject(new Error('Could not load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 3 * 1024 * 1024 // 3MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'File must be JPEG, PNG, or WebP' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File must be less than 3MB' }
  }
  
  return { valid: true }
}

export async function resizeImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      let { width, height } = img
      
      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create blob'))
          return
        }
        
        const newFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        })
        
        resolve(newFile)
      }, file.type, 0.9) // 0.9 quality
    }
    
    img.onerror = () => {
      reject(new Error('Could not load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

