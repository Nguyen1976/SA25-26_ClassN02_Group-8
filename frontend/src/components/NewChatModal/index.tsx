'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X, Search } from 'lucide-react'
import { useState } from 'react'

interface User {
  id: string
  name: string
  avatar: string
  isOnline?: boolean
}

interface NewChatModalProps {
  users: User[]
  onClose: () => void
  onSelectUser: (userId: string) => void
}

export function NewChatModal({
  users,
  onClose,
  onSelectUser,
}: NewChatModalProps) {
  const [search, setSearch] = useState('')

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-bg-voice-call rounded-2xl w-full max-w-md mx-4 overflow-hidden'>
        <div className='flex items-center justify-between p-6 border-b border-button'>
          <h2 className='text-xl font-semibold text-text'>New Chat</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='hover:bg-button text-gray-400 hover:text-text'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        <div className='p-6'>
          <div className='relative mb-4'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search users...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full bg-button text-text placeholder:text-gray-500 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-bg-box-message-out'
            />
          </div>

          <div className='space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar'>
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className='w-full flex items-center gap-3 p-3 hover:bg-button rounded-lg transition-colors'
              >
                <div className='relative'>
                  <Avatar className='w-10 h-10'>
                    <AvatarImage
                      src={user.avatar || '/placeholder.svg'}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className='absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-bg-voice-call' />
                  )}
                </div>
                <span className='text-text font-medium'>{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
