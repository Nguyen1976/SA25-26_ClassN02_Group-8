import { selectUser } from '@/redux/slices/userSlice'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector(selectUser)
  if (!user?.id) {
    console.log('no user')
    return <Navigate to='/auth' replace />
  }

  return children
}

export default ProtectedRoute
