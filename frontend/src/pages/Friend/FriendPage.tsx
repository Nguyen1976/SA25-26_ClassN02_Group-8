import { useState, useMemo } from 'react'
import { Search, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import MainLayout from '@/layouts/MainLayout'

interface Friend {
  username: string
  avatar: string
  id: string
  status: string
}

const friends: Friend[] = [
  {
    id: '1',
    username: 'Alice',
    avatar: '/avatar1.png',
    status: 'Online',
  },
  { id: '2', username: 'Bob', avatar: '/avatar2.png', status: 'Offline' },
  { id: '3', username: 'Charlie', avatar: '/avatar3.png', status: 'Away' },
] as Friend[]
export function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('friends') // "friends", "groups", "friend-requests", "group-invites"

  // Filter and sort friends
  const filteredFriends = useMemo(() => {
    const filtered = friends.filter((friend) =>
      friend.username.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort alphabetically
    filtered.sort((a, b) => a.username.localeCompare(b.username))

    return filtered
  }, [friends, searchTerm])

  // Group friends by first letter
  const groupedFriends = useMemo(() => {
    const groups: Record<string, { username: string; avatar: string }[]> = {}
    filteredFriends.forEach((friend) => {
      const firstLetter = friend.username[0].toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(friend)
    })
    return groups
  }, [filteredFriends])

  return (
    <MainLayout>
      <div className='flex-1 flex flex-col bg-black-bland'>
        {/* Header */}
        <div className='border-b p-4'>
          <h2 className='text-xl font-semibold mb-4'>Danh sách bạn bè</h2>

          {/* Search and Filter */}
          <div className='flex gap-3 items-center'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Tìm bạn'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Button
              variant='outline'
              size='sm'
              className='whitespace-nowrap bg-transparent'
            >
              Tiên (A-Z)
            </Button>
            <Button variant='outline' size='icon'>
              <Settings className='w-4 h-4' />
            </Button>
          </div>
        </div>

        {/* Left Sidebar Tabs */}
        <div className='flex'>
          <div className='w-64 border-r flex flex-col bg-black-bland'>
            {/* Tab Buttons */}
            <div className='p-4 flex flex-col gap-2'>
              <Button
                variant={activeTab === 'friends' ? 'default' : 'ghost'}
                className='justify-start'
                onClick={() => setActiveTab('friends')}
              >
                Danh sách bạn bè
              </Button>
              <Button
                variant={activeTab === 'groups' ? 'default' : 'ghost'}
                className='justify-start'
                onClick={() => setActiveTab('groups')}
              >
                Danh sách nhóm và cộng đồng
              </Button>
              <Button
                variant={activeTab === 'friend-requests' ? 'default' : 'ghost'}
                className='justify-start'
                onClick={() => setActiveTab('friend-requests')}
              >
                Lời mời kết bạn
              </Button>
              <Button
                variant={activeTab === 'group-invites' ? 'default' : 'ghost'}
                className='justify-start'
                onClick={() => setActiveTab('group-invites')}
              >
                Lời mời vào nhóm và cộng đồng
              </Button>
            </div>
          </div>

          {/* Friends List */}
          <ScrollArea className='flex-1'>
            <div className='p-6'>
              {Object.entries(groupedFriends).map(([letter, groupFriends]) => (
                <div key={letter} className='mb-6'>
                  {/* Letter Header */}
                  <h3 className='text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide'>
                    {letter}
                  </h3>

                  {/* Friends in this group */}
                  <div className='space-y-2'>
                    {groupFriends.map((friend) => (
                      <button
                        key={friend.username}
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
              ))}

              {filteredFriends.length === 0 && (
                <div className='text-center py-12'>
                  <p className='text-muted-foreground'>Không tìm thấy bạn bè</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </MainLayout>
  )
}
