import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  getFriendRequestDetail,
  updateFriendRequestStatus,
  type DetailMakeFriendResponse,
} from '@/apis'
import { useSelector } from 'react-redux'
import { selectUser } from '@/redux/slices/userSlice'
import { toast } from 'sonner'

interface FriendRequestModalProps {
  friendRequestId: string
  isOpen: boolean
  onClose: () => void
}

const FriendRequestModal = ({
  isOpen,
  friendRequestId,
  onClose,
}: FriendRequestModalProps) => {
  const [friendRequestData, setFriendRequestData] =
    useState<DetailMakeFriendResponse | null>(null)

  const user = useSelector(selectUser)

  useEffect(() => {
    if (isOpen) {
      getFriendRequestDetail(friendRequestId).then((data) => {
        setFriendRequestData(data)
      })
    }
  }, [isOpen, friendRequestId])

  const onAccept = async () => {
    if (!friendRequestData) return
    if (friendRequestData.status !== 'PENDING') {
      toast.error('This friend request has already been responded to.')
      onClose()
      return
    }
    await updateFriendRequestStatus({
      inviterId: friendRequestData?.fromUser?.id || '',
      inviteeName: user?.username || '',
      status: 'ACCEPTED',
    }).then(() => {
      onClose()
    })
  }

  const onReject = async () => {
    if (!friendRequestData) return
    if (friendRequestData.status !== 'PENDING') {
      toast.error('This friend request has already been responded to.')
      onClose()
      return
    }
    await updateFriendRequestStatus({
      inviterId: friendRequestData?.fromUser?.id || '',
      inviteeName: user?.username || '',
      status: 'REJECTED',
    }).then(() => {
      onClose()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center'>Friend Request</DialogTitle>
          <DialogDescription className='text-center'>
            You received a new invitation to connect.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center justify-center py-6 gap-4'>
          <Avatar className='w-24 h-24 border-4 border-background shadow-lg'>
            <AvatarImage
              src={friendRequestData?.fromUser?.avatar || '/placeholder.svg'}
              alt={friendRequestData?.fromUser?.username || 'User Avatar'}
            />
            <AvatarFallback>
              {friendRequestData?.fromUser?.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className='text-center'>
            <h3 className='text-xl font-bold'>
              {friendRequestData?.fromUser?.username}
            </h3>
            <p className='text-muted-foreground'>
              {friendRequestData?.fromUser?.email ||
                `${friendRequestData?.fromUser?.username
                  .toLowerCase()
                  .replace(' ', '.')}@example.com`}
            </p>
          </div>
        </div>
        <DialogFooter className='flex sm:justify-center gap-2'>
          <Button
            variant='outline'
            className='flex-1 sm:flex-none bg-transparent'
            onClick={onReject}
          >
            Reject
          </Button>
          <Button className='flex-1 sm:flex-none' onClick={onAccept}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FriendRequestModal
