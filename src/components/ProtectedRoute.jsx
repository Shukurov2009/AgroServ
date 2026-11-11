import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

export function ProtectedRoute({ children }) {
  const { currentUser } = useStore()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />
  }
  return children
}

export function RoleRoute({ roles, children }) {
  const { currentUser } = useStore()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />
  }
  if (!roles.includes(currentUser.role)) {
    return <Navigate to="/kabinet" replace />
  }
  return children
}
