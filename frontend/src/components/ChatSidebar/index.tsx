import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '../ModeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { AppDispatch } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import {
  getConversations,
  type Conversation,
  type ConversationMember,
} from '@/redux/slices/conversationSlice'
import { formatDateTime } from '@/utils/formatDateTime'
import { selectUser } from '@/redux/slices/userSlice'

interface ChatSidebarProps {
  setSelectedChatId: (chatId: string) => void
  onNewChat: () => void
  selectedChatId: string | null
}

export function ChatSidebar({
  setSelectedChatId,
  onNewChat,
  selectedChatId,
}: ChatSidebarProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const user = useSelector(selectUser)
  useEffect(() => {
    dispatch(getConversations({ limit: 10, page: 1 })).then((response) => {
      setConversations(
        response.payload.conversations.map((c: Conversation) => {
          return {
            ...c,
            groupName:
              c.type === 'DIRECT'
                ? c.members.find(
                    (p: ConversationMember) => p.userId !== user.id
                  )?.username || ''
                : c.groupName,
            groupAvatar:
              c.type === 'DIRECT'
                ? c.members.find(
                    (p: ConversationMember) => p.userId !== user.id
                  )?.avatar || ''
                : c.groupAvatar,
            messages: c.messages !== undefined ? c.messages : [],
          }
        })
      )
    })
  }, [dispatch, user.id])

  return (
    <div className='bg-black-bland border-r border-bg-box-message-incoming flex flex-col custom-scrollbar'>
      <div className='flex items-center justify-between p-4 border-b border-bg-box-message-incoming'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='start'>
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className='flex gap-2'>
          <ModeToggle />
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onNewChat()}
            className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
          >
            <Plus className='w-5 h-5' />
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {conversations?.map((conversation: Conversation) => (
          <button
            key={conversation.id}
            onClick={() => {
              setSelectedChatId(conversation.id)
            }}
            className={cn(
              'w-full p-4 flex items-start gap-3 hover:bg-bg-box-message-incoming/50 transition-colors border-b border-bg-box-message-incoming/30',
              selectedChatId === conversation.id && 'bg-bg-box-message-incoming'
            )}
          >
            <div className='relative'>
              <Avatar className='w-12 h-12'>
                <AvatarImage
                  src={conversation.groupAvatar || ''}
                  alt={conversation.groupName || ''}
                />
                <AvatarFallback>
                  {(conversation.groupName || 'C')[0]}
                </AvatarFallback>
              </Avatar>
              {/* {conversation.isOnline && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black-bland' />
              )} */}
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
                {conversation.messages.length > 0
                  ? conversation.messages[0].text
                  : 'No messages yet.'}
              </p>
            </div>

            {conversation.unreadCount &&
              Number(conversation.unreadCount) > 0 && (
                <div className='w-6 h-6 bg-bg-box-message-out rounded-full flex items-center justify-center'>
                  <span className='text-xs text-text font-medium'>
                    {conversation.unreadCount}
                  </span>
                </div>
              )}
          </button>
        ))}
      </div>
    </div>
  )
}
