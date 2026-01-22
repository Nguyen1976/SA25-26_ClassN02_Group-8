import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getFriends, selectFriend, type Friend } from '@/redux/slices/friendSlice'
import type { AppDispatch } from '@/redux/store'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const ListFriend = () => {
  const dispatch = useDispatch<AppDispatch>()
    const friends = useSelector(selectFriend) || []
  useEffect(() => {
    //fetch friends từ redux store hoặc API
    dispatch(getFriends())
  }, [dispatch])
  return (
    <>
      {/* Friends List */}
      <ScrollArea className='flex-1'>
        <div className='p-6'>
            <div className='mb-6'>
              {/* Letter Header */}
              {/* <h3 className='text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide'>
                {letter}
              </h3> */}

              {/* Friends in this group */}
              <div className='space-y-2'>
                {friends.map((friend: Friend) => (
                  <button
                    key={friend.id}
                    className='w-full p-3 rounded-lg flex items-center gap-3 hover:bg-accent transition-colors group'
                  >
                    <Avatar className='w-12 h-12 flex-shrink-0'>
                      <AvatarImage
                        src={friend.avatar || '/placeholder.svg'}
                        alt={friend.username}
                      />
                      <AvatarFallback>{friend.username[0]}</AvatarFallback>
                    </Avatar>

                    <div className='flex-1 min-w-0 text-left'>
                      <p className='font-medium text-foreground truncate'>
                        {friend.username}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {'Offline'}
                      </p>
                    </div>

                    {/* Action Menu */}
                    <Button
                      variant='ghost'
                      size='icon'
                      className='opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <span className='text-xl'>⋮</span>
                    </Button>
                  </button>
                ))}
              </div>
            </div>

          {/* {filteredFriends.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>Không tìm thấy bạn bè</p>
            </div>
          )} */}
        </div>
      </ScrollArea>
    </>
  )
}

export default ListFriend
