import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bell, MoreHorizontal, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/redux/store'
import {
  addNotification,
  getNotifications,
  selectNotification,
  type Notification,
} from '@/redux/slices/notificationSlice'
import { formatDateTime } from '@/utils/formatDateTime'
import { socket } from '@/lib/socket'
import useSound from 'use-sound'
import notificationSound from '@/assets/notification.mp3'

export function NotificationsDropdown() {
  const dispatch = useDispatch<AppDispatch>()
  const notifications = useSelector(selectNotification)

  useEffect(() => {
    if (notifications.length === 0) {
      dispatch(getNotifications({ limit: 10, page: 1 }))
    }
  }, [dispatch, notifications.length])

  const [play] = useSound(notificationSound, { volume: 0.5 })

  useEffect(() => {
    const onNewNotification = (data: Notification) => {
      dispatch(addNotification(data))
      play()
    }
    socket.on('notification.new_notification', onNewNotification)

    return () => {
      socket.off('notification.new_notification', onNewNotification)
    }
  }, [dispatch, play])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative text-muted-foreground hover:text-foreground'
        >
          <Bell className='w-5 h-5 text-text' />
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className='absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 p-0 overflow-hidden'
        align='start'
        sideOffset={8}
      >
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-sm font-semibold'>Notifications</h2>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-muted-foreground'
          >
            <MoreHorizontal className='w-4 h-4' />
          </Button>
        </div>

        <ScrollArea className='max-h-96 h-96'>
          {notifications.length > 0 ? (
            <div className='flex flex-col'>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    'w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left border-b last:border-0',
                    !n.isRead && 'bg-primary/5'
                  )}
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs leading-relaxed'>{n.message}</p>
                    <span
                      className={cn(
                        'text-[10px] mt-1 block text-muted-foreground'
                      )}
                    >
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.isRead && (
                    <div className='w-2 h-2 bg-primary rounded-full mt-2' />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className='p-8 text-center'>
              <p className='text-muted-foreground text-xs'>
                No new notifications
              </p>
            </div>
          )}
        </ScrollArea>

        <div className='p-2 border-t'>
          <Button
            variant='ghost'
            className='w-full text-xs text-primary hover:bg-primary/10 justify-center gap-2 h-8'
          >
            <Check className='w-3 h-3' />
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
