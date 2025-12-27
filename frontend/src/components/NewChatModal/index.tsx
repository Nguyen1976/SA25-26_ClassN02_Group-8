'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X, Search, Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { useDispatch, useSelector } from 'react-redux'
import {
  getFriends,
  selectFriend,
  type FriendState,
} from '@/redux/slices/friendSlice'
import type { AppDispatch } from '@/redux/store'
import { useForm } from 'react-hook-form'
import { createConversation } from '@/redux/slices/conversationSlice'
import { toast } from 'sonner'

interface NewChatModalProps {
  onClose: () => void
}

export function NewChatModal({ onClose }: NewChatModalProps) {
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [friends, setFriends] = useState<FriendState['friends']>([])
  const [slectedFriends, setSelectedFriends] = useState<string[]>([])

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    //fetch friends từ redux store hoặc API
    dispatch(getFriends()).then((res) => {
      setFriends(res.payload.friends)
    })
  }, [dispatch])

  const inputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit } = useForm<{ groupName: string }>()

  const friendsOnStore = useSelector(selectFriend)

  const onSubmit = (data: { groupName: string }) => {
    dispatch(
      createConversation({
        groupName: data.groupName,
        members: friendsOnStore.friends
          .filter((friend) => slectedFriends.includes(friend.id))
          .map((friend) => ({
            userId: friend.id,
            username: friend.username,
            avatar: friend.avatar,
          })),
      })
    )
      .unwrap()
      .finally(() => {
        toast.success('Conversation created successfully')
        onClose()
      })
  }

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <form
        className='bg-bg-voice-call rounded-2xl w-full max-w-md mx-4 overflow-hidden'
        onSubmit={handleSubmit(onSubmit)}
      >
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

        <div className='p-6 pb-0'>
          <Input
            type='file'
            accept='image/*'
            ref={inputRef}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setPreview(URL.createObjectURL(file))
            }}
          />
          <div className='flex items-center gap-2'>
            <Avatar
              className='w-12 h-12 mb-4 flex items-center justify-center bg-muted'
              onClick={() => inputRef.current?.click()}
            >
              {!preview ? (
                <Camera className='w-6 h-6 text-muted-foreground' />
              ) : (
                <AvatarImage src={preview} alt='Preview' />
              )}
            </Avatar>
            <Input
              className='border-none mb-4 focus:ring-bg-box-message-out! bg-button! text-text outline-none'
              type='text'
              placeholder='Group name'
              {...register('groupName', { required: 'Group name is required' })}
            />
          </div>
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
            {friends?.map((user) => (
              <div
                key={user.id}
                className='w-full flex items-center gap-3 p-3 hover:bg-button rounded-lg transition-colors'
              >
                <Checkbox
                  id={`${user.id}`}
                  checked={slectedFriends.includes(user.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFriends((state) => [...state, user.id])
                    } else {
                      setSelectedFriends((state) =>
                        state.filter((id) => id !== user.id)
                      )
                    }
                  }}
                />
                <div className='relative'>
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src={'/placeholder.svg'} alt={user.username} />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  {/* {user.isOnline && (
                    <div className='absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-bg-voice-call' />
                  )} */}
                </div>
                <span className='text-text font-medium'>{user.username}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='w-full flex justify-end'>
          <Button type='submit' className='m-4 interceptor-loading'>
            Start Chat
          </Button>
        </div>
      </form>
    </div>
  )
}
