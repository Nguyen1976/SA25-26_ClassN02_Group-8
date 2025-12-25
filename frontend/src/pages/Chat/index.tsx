import { useState } from 'react'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatWindow } from '@/components/ChatWindow'
import { NewChatModal } from '@/components/NewChatModal'
import { ProfilePanel } from '@/components/ProfilePanel'
import { VoiceCallModal } from '@/components/VoiceCallModal'
import { ThemeProvider } from '@/components/ThemeProvider'

export default function ChatPage() {
  const [showProfile, setShowProfile] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showVoiceCall, setShowVoiceCall] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className='flex h-screen bg-bg-box-chat text-text overflow-hidden'>
        <ChatSidebar
          setSelectedChatId={setSelectedChatId}
          onNewChat={() => setShowNewChat(true)}
          selectedChatId={selectedChatId}
        />

        <ChatWindow
          conversationId={selectedChatId || undefined}
          onToggleProfile={() => setShowProfile(!showProfile)}
          onVoiceCall={() => setShowVoiceCall(true)}
        />

        {/*
        {showProfile && selectedUser && (
          <ProfilePanel
            user={selectedUser}
            onClose={() => setShowProfile(false)}
          />
        )} */}

        {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}

        {/*
        {showVoiceCall && selectedUser && (
          <VoiceCallModal
            user={selectedUser}
            onClose={() => setShowVoiceCall(false)}
          />
        )} */}
      </div>
    </ThemeProvider>
  )
}
