import { cn } from '@/lib/utils'
import type { Message } from '@/redux/slices/messageSlice'
import { selectUser } from '@/redux/slices/userSlice'
import { formatDateTime } from '@/utils/formatDateTime'
import { useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { User } from 'lucide-react'

const MessageComponent = ({ messages }: { messages: Message[] }) => {
  const user = useSelector(selectUser)

  return (
    <>
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1]
        const nextMessage = messages[index + 1]

        const isMine = message.senderId === user.id

        const isSameAsPrev = prevMessage?.senderId === message.senderId

        const isSameAsNext = nextMessage?.senderId === message.senderId

        const showAvatar = !isSameAsPrev

        return (
          <div key={message.id} className='mb-1'>
            <div
              className={cn(
                'flex items-end gap-2',
                isMine ? 'justify-end' : 'justify-start'
              )}
            >
              {!isMine && showAvatar ? (
                <Avatar className='w-10 h-10 border border-bg-box-message-incoming'>
                  <AvatarImage src={message.senderMember?.avatar} />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              ) : (
                !isMine && <div className='w-10 h-10' />
              )}

              <div
                className={cn(
                  'max-w-md px-4 py-2 text-sm',
                  isMine
                    ? 'bg-bg-box-message-out text-text'
                    : 'bg-bg-box-message-incoming text-text',

                  // Bo góc theo chuỗi
                  isMine
                    ? cn(
                        'rounded-2xl',
                        isSameAsPrev && 'rounded-tr-md',
                        isSameAsNext && 'rounded-br-md'
                      )
                    : cn(
                        'rounded-2xl',
                        isSameAsPrev && 'rounded-tl-md',
                        isSameAsNext && 'rounded-bl-md'
                      )
                )}
              >
                <p className='break-words'>{message.text}</p>

                {/* Hiện time ở tin cuối */}
                {!isSameAsNext && (
                  <span className='text-xs opacity-70 mt-1 block'>
                    {formatDateTime(message.createdAt)}
                  </span>
                )}
              </div>
            </div>
            {isMine && !isSameAsNext && (
              <div className='flex justify-end mr-10 status-auto-hide h-3'>
                <span className='mt-1 text-[11px] text-gray-400'>
                  {message?.status}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export default MessageComponent
