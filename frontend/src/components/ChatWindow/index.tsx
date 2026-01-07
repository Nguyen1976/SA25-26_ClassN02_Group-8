import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  readMessage,
  updateNewMessage,
  type ConversationState,
} from '@/redux/slices/conversationSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { formatDateTime } from '@/utils/formatDateTime'
import type { AppDispatch, RootState } from '@/redux/store'
import { selectUser } from '@/redux/slices/userSlice'
import { socket } from '@/lib/socket'
import {
  addMessage,
  getMessages,
  selectMessage,
  sendMessage,
  type Message,
} from '@/redux/slices/messageSlice'
import notificationSound from '@/assets/notification.mp3'
import useSound from 'use-sound'

interface ChatWindowProps {
  conversationId?: string
  onToggleProfile: () => void
  onVoiceCall: () => void
}

export default function ChatWindow({
  conversationId,
  onToggleProfile,
  onVoiceCall,
}: ChatWindowProps) {
  const [play] = useSound(notificationSound, { volume: 0.5 })
  const [msg, setMsg] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()

  const conversation = useSelector(
    (state: { conversations: ConversationState }) => {
      return state.conversations?.find((c) => c.id === conversationId)
    }
  )
  const user = useSelector(selectUser)
  const messages = useSelector((state: RootState) =>
    selectMessage(state, conversationId)
  )

  useEffect(() => {
    if (messages.length === 0) {
      dispatch(getMessages({ conversationId: conversationId || '' }))
    }
  }, [dispatch, messages.length, conversationId])

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
    if (!conversationId) return
    if (messages.length === 0) return

    const lastMessage: Message = messages[messages.length - 1]

    // Chỉ đánh dấu read nếu message KHÔNG phải của mình
    if (lastMessage.senderMember?.userId === user.id) return

    dispatch(
      readMessage({
        conversationId,
        lastReadMessageId: lastMessage.id,
      })
    )
  }, [messages, conversationId, dispatch, user.id])

  const handleSendMessage = () => {
    if (msg.trim() === '' || !conversationId) return
    dispatch(sendMessage({ conversationId, message: msg })).then((res) => {
      dispatch(
        updateNewMessage({
          conversationId,
          lastMessage: res.payload.message as Message,
        })
      )
    })
    setMsg('')
  }

  return (
    <div className='flex-1 flex flex-col bg-bg-box-chat'>
      {/* Header */}
      <div className='h-16 bg-black-bland border-b border-bg-box-message-incoming flex items-center justify-between px-6'>
        <button
          onClick={onToggleProfile}
          className='flex items-center gap-3 hover:opacity-80 transition-opacity'
        >
          <Avatar className='w-10 h-10'>
            <AvatarImage
              src={conversation?.groupAvatar || '/placeholder.svg'}
              alt={conversation?.groupName || 'Group Avatar'}
            />
            <AvatarFallback>{conversation?.groupName?.[0]}</AvatarFallback>
          </Avatar>
          <div className='text-left'>
            <div className='font-medium text-text'>
              {conversation?.groupName}
            </div>
            <div className='text-xs text-gray-400'>{conversation?.type}</div>
          </div>
        </button>

        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onVoiceCall}
            className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
          >
            <Phone className='w-5 h-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
          >
            <Video className='w-5 h-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={onToggleProfile}
            className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
          >
            <MoreVertical className='w-5 h-5' />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar'>
        {messages?.map((message: Message) => (
          <div key={message.id}>
            <div
              className={cn(
                'flex',
                message.senderMember?.userId === user.id
                  ? 'justify-end'
                  : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-md px-4 py-3 rounded-2xl',
                  message.senderMember?.userId === user.id
                    ? 'bg-bg-box-message-out text-text rounded-br-md'
                    : 'bg-bg-box-message-incoming text-text rounded-bl-md'
                )}
              >
                <p className='text-sm break-words'>{message.text}</p>
                <span className='text-xs opacity-70 mt-1 block'>
                  {formatDateTime(message.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className='h-16 bg-black-bland border-t border-bg-box-message-incoming flex items-center gap-3 px-6'>
        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
        >
          <Paperclip className='w-5 h-5' />
        </Button>

        <input
          type='text'
          placeholder='Write a message...'
          className='flex-1 bg-transparent text-text placeholder:text-gray-500 outline-none text-sm'
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />

        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
        >
          <Smile className='w-5 h-5' />
        </Button>

        <Button
          size='icon'
          className='bg-bg-box-message-out hover:bg-purple-700 text-text rounded-full'
          onClick={handleSendMessage}
          //enter to send message
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }}
        >
          <Send className='w-5 h-5' />
        </Button>
      </div>
    </div>
  )
}
