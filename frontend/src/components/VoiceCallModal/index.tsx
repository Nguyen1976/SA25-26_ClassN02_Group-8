import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type {
  Conversation,
  ConversationState,
} from '@/redux/slices/conversationSlice'
import { X, Mic, Volume2 } from 'lucide-react'
import { useSelector } from 'react-redux'

interface VoiceCallModalProps {
  conversationId: string
  onClose: () => void
}

export function VoiceCallModal({
  conversationId,
  onClose,
}: VoiceCallModalProps) {
  const conversation = useSelector(
    (state: { conversations: ConversationState }) => {
      return state.conversations?.find((c) => c.id === conversationId)
    }
  ) as Conversation

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-bg-voice-call rounded-2xl w-full max-w-sm mx-4 p-8 relative'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='absolute top-4 right-4 hover:bg-button text-gray-400 hover:text-text'
        >
          <X className='w-5 h-5' />
        </Button>

        <div className='flex flex-col items-center'>
          <Avatar className='w-32 h-32 mb-6'>
            <AvatarImage
              src={conversation.groupAvatar || '/placeholder.svg'}
              alt={conversation.groupName}
            />
            <AvatarFallback className='text-3xl'>
              {conversation.groupName?.[0]}
            </AvatarFallback>
          </Avatar>

          <h3 className='text-2xl font-semibold text-text mb-2'>
            {conversation.groupName}
          </h3>
          <p className='text-gray-400 mb-8'>Voice calling...</p>

          <div className='flex gap-6'>
            <Button
              variant='ghost'
              size='icon'
              className='w-14 h-14 rounded-full bg-button hover:bg-[#a9a9bd] text-text'
            >
              <Mic className='w-6 h-6' />
            </Button>

            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-text'
            >
              <X className='w-6 h-6' />
            </Button>

            <Button
              variant='ghost'
              size='icon'
              className='w-14 h-14 rounded-full bg-button hover:bg-[#a9a9bd] text-text'
            >
              <Volume2 className='w-6 h-6' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
