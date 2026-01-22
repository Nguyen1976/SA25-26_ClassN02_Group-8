import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ModeToggle } from '../ModeToggle'
import type { AppDispatch } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import {
  addConversation,
  getConversations,
  selectConversation,
  updateNewMessage,
  upUnreadCount,
  type Conversation,
} from '@/redux/slices/conversationSlice'
import { formatDateTime } from '@/utils/formatDateTime'
import { socket } from '@/lib/socket'
import { selectUser } from '@/redux/slices/userSlice'
import MenuCustome from './Menu'
import { NotificationsDropdown } from '../NotificationDropdown'
import type { Message } from '@/redux/slices/messageSlice'
import { useNavigate, useParams } from 'react-router'



export function ChatSidebar() {
  const [page, setPage] = useState(1)

  const selectedChatId = useParams().conversationId || ''
  const selectedChatIdRef = useRef<string | null>(null) //fix lỗi về stale closure
  

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId
  }, [selectedChatId])

  const conversations = useSelector(selectConversation)
  const user = useSelector(selectUser)

  const dispatch = useDispatch<AppDispatch>()

  const navigate = useNavigate()

  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(getConversations({ limit: 10, page: 1 }))
    }
  }, [dispatch, conversations?.length])

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
    const handler = (data: Message) => {
      dispatch(
        updateNewMessage({
          conversationId: data.conversationId,
          lastMessage: { ...data },
        })
      )
      if (data.conversationId !== selectedChatIdRef.current) {
        dispatch(
          upUnreadCount({
            conversationId: data.conversationId,
          })
        )
      }

      //cap nhat last message trong notification
      //đưa notification lên đầu
    }

    socket.on('chat.new_message', handler)

    return () => {
      socket.off('chat.new_message', handler)
    }
  }, [dispatch, selectedChatId])

  const loadMoreConversations = () => {
    const nextPage = page + 1
    dispatch(getConversations({ limit: 10, page: nextPage }))
    setPage(nextPage)
  }

  return (
    <div className='w-1/3 bg-black-bland border-r border-bg-box-message-incoming flex flex-col custom-scrollbar'>
      <div className='flex items-center justify-end p-4 border-b border-bg-box-message-incoming'>

        <div className='flex gap-2 items-center'>
          <ModeToggle />
          <NotificationsDropdown />
          <MenuCustome />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {conversations?.map((conversation: Conversation) => (
          <button
            key={conversation.id}
            onClick={() => {
              navigate(`/chat/${conversation.id}`)
            }}
            className={cn(
              'w-full p-4 flex items-start gap-3 hover:bg-bg-box-message-incoming/50 transition-colors border-b border-bg-box-message-incoming/30',
              selectedChatId === conversation.id && 'bg-bg-box-message-incoming'
            )}
          >
            <div className='relative'>
              {conversation.type === 'DIRECT' ? (
                <Avatar className='w-12 h-12'>
                  <AvatarImage
                    src={conversation.groupAvatar || ''}
                    alt={conversation.groupName || ''}
                  />
                  <AvatarFallback>
                    {(conversation.groupName || 'C')[0]}
                  </AvatarFallback>
                </Avatar>
              ) : (
                // {/* {conversation.isOnline && (
                //   <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black-bland' />
                // )} */}

                <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
                  <Avatar>
                    <AvatarImage
                      src={
                        conversation.groupAvatar ||
                        conversation.members?.[0]?.avatar ||
                        ''
                      }
                      alt={conversation.groupName || ''}
                    />
                    <AvatarFallback>
                      {(conversation.groupName || 'C')[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.members.length >= 2 && (
                    <Avatar>
                      <AvatarFallback>
                        {conversation.members.length - 1 <= 99
                          ? conversation.members.length - 1
                          : '99+'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}
            </div>

            <div className='flex-1 min-w-0 text-left'>
              <div className='flex items-center justify-between mb-1'>
                <span className='font-medium text-text truncate'>
                  {conversation.groupName}
                </span>
                <span className='text-xs text-gray-400 ml-2'>
                  {formatDateTime(conversation.updatedAt)}
                </span>
              </div>
              <p className='text-sm text-gray-400 truncate'>
                {conversation?.lastMessage
                  ? conversation.lastMessage.text
                  : 'No messages yet.'}
              </p>
            </div>

            {conversation.unreadCount &&
              (Number(conversation.unreadCount) > 0 ||
                conversation.unreadCount === '5+') && (
                <div className='w-6 h-6 bg-bg-box-message-out rounded-full flex items-center justify-center'>
                  <span className='text-xs text-text font-medium'>
                    {conversation.unreadCount}
                  </span>
                </div>
              )}
          </button>
        ))}
        <div className='w-full flex items-center justify-center my-4'>
          <Button
            className='interceptor-loading'
            onClick={() => loadMoreConversations()}
          >
            Load More
          </Button>
        </div>
      </div>
    </div>
  )
}
