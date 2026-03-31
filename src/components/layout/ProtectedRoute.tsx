import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isBetaAuthenticated } from '../../lib/betaAuth'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (!isBetaAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <>{children}</>
}
