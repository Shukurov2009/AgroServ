import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import LoadingScreen from './LoadingScreen'

function useAuthGate() {
  const { currentUser, ready, apiError } = useStore()
  const location = useLocation()
  const from = `${location.pathname}${location.search}`
  return { currentUser, ready, apiError, from }
}

export function ProtectedRoute({ children }) {
  const { currentUser, ready, apiError, from } = useAuthGate()

  if (!ready) return <LoadingScreen />
  if (!currentUser) {
    if (apiError) return <LoadingScreen error={apiError} />
    return <Navigate to="/login" state={{ from }} replace />
  }
  return children
}

export function RoleRoute({ roles, children }) {
  const { currentUser, ready, apiError, from } = useAuthGate()

  if (!ready) return <LoadingScreen />
  if (!currentUser) {
    if (apiError) return <LoadingScreen error={apiError} />
    return <Navigate to="/login" state={{ from }} replace />
  }
  if (!roles.includes(currentUser.role)) {
    return <Navigate to="/kabinet" replace />
  }
  return children
}
