'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AboutSection() {
  const [isVisible, setIsVisible] = useState(true)

  // Load visibility state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('aboutSectionDismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('aboutSectionDismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="mb-8 p-6 bg-card rounded-lg border relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={handleClose}
        aria-label="Close about section"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <h2 className="text-xl font-semibold mb-3">About wefrigerator</h2>
      <p className="text-muted-foreground leading-relaxed pr-8">
        wefrigerator connects communities with local community fridges—free food 
        resources available to anyone who needs them. Track real-time status updates, 
        find fridges near you, request needed items, and volunteer to help maintain 
        these vital community resources. Together, we&apos;re building a network of food 
        access and mutual aid.
      </p>
    </div>
  )
}

