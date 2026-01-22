import { useEffect, useRef } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/Auth'
import ChatPage from './pages/Chat'

import { createBrowserRouter, RouterProvider, useParams } from 'react-router'
import { socket } from './lib/socket'
import { FriendsPage } from './pages/Friend/FriendPage'
import ListFriend from './pages/Friend/ListFriend'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './redux/store'
import { addMessage, type Message } from './redux/slices/messageSlice'
import { useSound } from 'use-sound'
import notificationSound from './assets/notification.mp3'
import {
  addConversation,
  updateNewMessage,
  upUnreadCount,
  type Conversation,
} from './redux/slices/conversationSlice'
import { selectUser } from './redux/slices/userSlice'
import {
  addNotification,
  type Notification,
} from './redux/slices/notificationSlice'

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chat/:conversationId',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/friends',
    element: (
      <ProtectedRoute>
        <FriendsPage>
          <ListFriend />
        </FriendsPage>
      </ProtectedRoute>
    ),
  },
  {
    path: '/groups',
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/friend_requests',
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
    ),
  },
])

function App() {
  const user = useSelector(selectUser)

  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  const dispatch = useDispatch<AppDispatch>()
  const [play] = useSound(notificationSound, { volume: 0.5 })

  useEffect(() => {
    const handler = (data: Message) => {
      dispatch(addMessage(data))
      play()
    }

    socket.on('chat.new_message', handler)

    return () => {
      socket.off('chat.new_message', handler)
    }
  }, [dispatch, play])

  useEffect(() => {
    const onNewConversation = ({
      conversation,
    }: {
      conversation: Conversation
    }) => {
      dispatch(addConversation({ conversation, userId: user.id }))
    }

    socket.on('chat.new_conversation', onNewConversation)

    return () => {
      socket.off('chat.new_conversation', onNewConversation)
    }
  }, [user.id, dispatch])

  useEffect(() => {
    const onNewNotification = (data: Notification) => {
      dispatch(addNotification(data))
      play()
    }
    socket.on('notification.new_notification', onNewNotification)

    return () => {
      socket.off('notification.new_notification', onNewNotification)
    }
  }, [dispatch, play])

  const selectedChatId = useParams().conversationId || ''
  const selectedChatIdRef = useRef<string | null>(null) //fix lỗi về stale closure

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId
  }, [selectedChatId])
  //liên quan đến việc state closure
  //tức 1 handler nó chỉ đăng ký state 1 lần khi component mount
  //nên khi state thay đổi thì handler ko nhận đc giá trị mới
  //giải pháp là dùng useRef để lưu trữ giá trị mới nhất
  //bản chất biến sẽ k sống qua re-render nhưng ref thì luôn tồn tại và k bị ảnh hưởng bởi lifecycle


  useEffect(() => {
    const handler = (data: Message) => {
      dispatch(
        updateNewMessage({
          conversationId: data.conversationId,
          lastMessage: { ...data },
        }),
      )
      if (data.conversationId !== selectedChatIdRef.current) {
        dispatch(
          upUnreadCount({
            conversationId: data.conversationId,
          }),
        )
      }

      //cap nhat last message trong notification
      //đưa notification lên đầu
    }

    socket.on('chat.new_message', handler)

    return () => {
      socket.off('chat.new_message', handler)
    }
  }, [dispatch])

  return <RouterProvider router={router} />
}

export default App
