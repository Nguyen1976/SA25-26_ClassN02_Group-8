import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ProfileSettings } from '../Setting'
import { useSelector } from 'react-redux'
import { selectUser } from '@/redux/slices/userSlice'

const ProfileSetting = () => {
  const [showSetting, setShowSetting] = useState(false)
  const user = useSelector(selectUser)

  return (
    <>
      {showSetting && <ProfileSettings onClose={() => setShowSetting(false)} />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <AvatarImage
              src={user.avatar || '/placeholder.svg'}
              alt={user.username}
            />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='start'>
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSetting(true)}>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default ProfileSetting
