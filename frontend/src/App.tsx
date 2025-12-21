import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/Auth'
import ChatPage from './pages/Chat'
import { createBrowserRouter, RouterProvider } from 'react-router'

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
])

function App() {
  return <RouterProvider router={router} />
}

export default App
