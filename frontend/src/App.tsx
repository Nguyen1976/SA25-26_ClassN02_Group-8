import { useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/Auth'
import ChatPage from './pages/Chat'

import { createBrowserRouter, RouterProvider } from 'react-router'
import { socket } from './lib/socket'
import { FriendsPage } from './pages/Friend/FriendPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/friend',
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
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
