import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CircleChevronDown,
} from 'lucide-react'
import {
  readMessage,
  updateNewMessage,
  type ConversationState,
} from '@/redux/slices/conversationSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppDispatch, RootState } from '@/redux/store'
import { selectUser } from '@/redux/slices/userSlice'
import {
  addMessage,
  getMessages,
  selectMessage,
  sendMessage,
  type Message,
} from '@/redux/slices/messageSlice'
import MessageComponent from './Messages'
import EmojiPicker from 'emoji-picker-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  const [msg, setMsg] = useState<string>('')

  const containerRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

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
    if (!isAtBottom) return

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages.length, isAtBottom])

  useEffect(() => {
    if (messages.length === 0) {
      dispatch(getMessages({ conversationId: conversationId || '' }))
    }
  }, [dispatch, messages.length, conversationId])

 
  useEffect(() => {
    if (!conversationId) return
    if (messages.length === 0) return

    const lastMessage: Message = messages[messages.length - 1]

    // Chỉ đánh dấu read nếu message KHÔNG phải của mình
    if (lastMessage.senderId === user.id) return

    dispatch(
      readMessage({
        conversationId,
        lastReadMessageId: lastMessage.id,
      })
    )
  }, [messages, conversationId, dispatch, user.id])

  const handleSendMessage = useCallback(() => {
    if (msg.trim() === '' || !conversationId) return

    const tempMessage: Message = {
      id: 'temp-id-' + Date.now(),
      conversationId,
      senderId: user.id,
      text: msg,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    dispatch(addMessage(tempMessage))
    dispatch(
      sendMessage({
        conversationId,
        message: msg,
        tempMessageId: tempMessage.id,
      })
    ).then((res) => {
      dispatch(
        updateNewMessage({
          conversationId,
          lastMessage: res.payload.message as Message,
        })
      )
    })
    setMsg('')

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [msg, dispatch, conversationId, user.id])

  useEffect(() => {
    window.onkeydown = (e) => {
      if (e.key === 'Enter') {
        handleSendMessage()
      }
    }
    return () => {
      window.onkeydown = null
    }
  }, [handleSendMessage])

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
      <div
        className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar'
        ref={containerRef}
        onScroll={() => {
          const el = containerRef.current
          if (!el) return

          const threshold = 120 // px
          const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < threshold

          setIsAtBottom(atBottom)
        }}
      >
        <MessageComponent messages={messages} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isAtBottom && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
          className='flex justify-center mx-auto bg-transparent'
        >
          <CircleChevronDown className='text-bg-box-message-out animate-bounce w-8 h-8' />
        </button>
      )}
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='
        text-gray-400 
        hover:text-text 
        hover:bg-bg-box-message-incoming
      '
            >
              <Smile className='w-5 h-5' />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side='top'
            align='end'
            className='p-0 border-none shadow-none bg-transparent'
          >
            <EmojiPicker
              height={360}
              width={300}
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
              onEmojiClick={(emoji) => {
                // TODO: insert emoji vào input
                setMsg((prev) => prev + emoji.emoji)
                //đóng popover sau khi chọn
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          size='icon'
          className='bg-bg-box-message-out hover:bg-purple-700 text-text rounded-full'
          onClick={handleSendMessage}
        >
          <Send className='w-5 h-5' />
        </Button>
      </div>
    </div>
  )
}
