import { Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MainLayout from '@/layouts/MainLayout'
import { useLocation, useNavigate } from 'react-router'

export function FriendsPage({children}: {children?: React.ReactNode}) {
  const location = useLocation()
  const params = location.pathname

  const navigate = useNavigate()
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
              {/* <Input
                placeholder='Tìm bạn'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              /> */}
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
                variant={params === '/friends' ? 'default' : 'ghost'}
                className='justify-start'
                onClick={() => navigate('/friends')}
              >
                Danh sách bạn bè
              </Button>
              <Button
                variant={params === '/groups' ? 'default' : 'ghost'}
                className='justify-start'
                onClick={() => navigate('/groups')}
              >
                Danh sách nhóm và cộng đồng
              </Button>
              <Button
                variant={params === '/friend-requests' ? 'default' : 'ghost'}
                className='justify-start'
                onClick={() => navigate('/friend_requests')}
              >
                Lời mời kết bạn
              </Button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </MainLayout>
  )
}
