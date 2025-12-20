import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface User {
  id: string
  name: string
  avatar: string
  status: string
  bio?: string
  phone?: string
}

interface ProfilePanelProps {
  user: User
  onClose: () => void
}

export function ProfilePanel({ user, onClose }: ProfilePanelProps) {
  return (
    <div className='w-[340px] bg-black-bland border-l border-bg-box-message-incoming flex flex-col custom-scrollbar'>
      <div className='flex items-center justify-between p-4 border-b border-bg-box-message-incoming'>
        <h2 className='text-lg font-semibold text-text'>Profile</h2>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
        >
          <X className='w-5 h-5' />
        </Button>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        <div className='p-6 space-y-6'>
          {/* Avatar */}
          <div className='flex flex-col items-center'>
            <Avatar className='w-32 h-32 mb-4'>
              <AvatarImage
                src={user.avatar || '/placeholder.svg'}
                alt={user.name}
              />
              <AvatarFallback className='text-3xl'>
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className='text-xl font-semibold text-text'>{user.name}</h3>
            <p className='text-sm text-gray-400'>{user.status}</p>
          </div>

          {/* Bio */}
          {user.bio && (
            <div>
              <h4 className='text-sm font-medium text-gray-400 mb-2'>Bio</h4>
              <p className='text-sm text-text'>{user.bio}</p>
            </div>
          )}

          {/* Phone */}
          {user.phone && (
            <div>
              <h4 className='text-sm font-medium text-gray-400 mb-2'>Mobile</h4>
              <p className='text-sm text-text'>{user.phone}</p>
            </div>
          )}

          {/* Settings */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-text'>Mute Chat</span>
              <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-bg-box-message-incoming transition-colors'>
                <span className='inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1' />
              </button>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-text'>Disappearing Messages</span>
              <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-bg-box-message-incoming transition-colors'>
                <span className='inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1' />
              </button>
            </div>
          </div>

          {/* Media */}
          <div>
            <h4 className='text-sm font-medium text-gray-400 mb-3'>
              Media, Links & Docs
            </h4>
            <div className='grid grid-cols-3 gap-2'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className='aspect-square bg-bg-box-message-incoming rounded-lg'
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
