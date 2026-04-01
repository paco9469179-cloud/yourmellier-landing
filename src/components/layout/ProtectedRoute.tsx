import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { isBetaAuthenticated, touchBetaSession } from '../../lib/betaAuth'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isBetaAuthenticated()) touchBetaSession()
  }, [location.pathname])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      if (!isBetaAuthenticated()) {
        navigate('/', { replace: true })
      } else {
        touchBetaSession()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [navigate])

  if (!isBetaAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <>{children}</>
}

/** Area `/beta/*`: autenticazione beta + `<Outlet />` per sotto-route. */
export function BetaProtectedOutlet() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isBetaAuthenticated()) touchBetaSession()
  }, [location.pathname])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      if (!isBetaAuthenticated()) {
        navigate('/', { replace: true })
      } else {
        touchBetaSession()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [navigate])

  if (!isBetaAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}
