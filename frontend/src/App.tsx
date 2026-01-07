import { lazy, Suspense, useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
// import AuthPage from './pages/Auth'
// import ChatPage from './pages/Chat'
const AuthPage = lazy(() => import('./pages/Auth'))
const ChatPage = lazy(() => import('./pages/Chat'))

import { createBrowserRouter, RouterProvider } from 'react-router'
import { socket } from './lib/socket'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={null}>
        <AuthPage />
      </Suspense>
    ),
  },
])

function App() {
  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  return <RouterProvider router={router} />
}

export default App
