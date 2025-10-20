'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserRoleType } from '@/lib/types'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRoleType[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const [userRole, setUserRole] = useState<UserRoleType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profile')
        .select('role')
        .eq('user_id', user.id)
        .single()

      setUserRole(profile?.role ?? 'visitor')
      setLoading(false)
    }

    checkRole()
  }, [])

  if (loading) {
    return null
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

