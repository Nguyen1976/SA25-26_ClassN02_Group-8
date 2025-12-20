'use client'

import { useState } from 'react'
import { mockUsers, mockMessages } from '@/lib/mock-data'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatWindow, type Message } from '@/components/ChatWindow'
import { NewChatModal } from '@/components/NewChatModal'
import { ProfilePanel } from '@/components/ProfilePanel'
import { VoiceCallModal } from '@/components/VoiceCallModal'
import { ThemeProvider } from '@/components/ThemeProvider'

export default function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState('2')
  const [showProfile, setShowProfile] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showVoiceCall, setShowVoiceCall] = useState(false)

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId)

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className='flex h-screen bg-bg-box-chat text-text overflow-hidden'>
        <ChatSidebar
          users={mockUsers}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          onNewChat={() => setShowNewChat(true)}
        />

        <ChatWindow
          user={selectedUser}
          messages={mockMessages[selectedUserId] as Message[]}
          onToggleProfile={() => setShowProfile(!showProfile)}
          onVoiceCall={() => setShowVoiceCall(true)}
        />

        {showProfile && selectedUser && (
          <ProfilePanel
            user={selectedUser}
            onClose={() => setShowProfile(false)}
          />
        )}

        {showNewChat && (
          <NewChatModal
            users={mockUsers}
            onClose={() => setShowNewChat(false)}
            onSelectUser={(userId) => {
              setSelectedUserId(userId)
              setShowNewChat(false)
            }}
          />
        )}

        {showVoiceCall && selectedUser && (
          <VoiceCallModal
            user={selectedUser}
            onClose={() => setShowVoiceCall(false)}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
