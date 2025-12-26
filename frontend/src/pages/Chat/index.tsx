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

        {selectedChatId ? (
          <ChatWindow
            conversationId={selectedChatId || undefined}
            onToggleProfile={() => setShowProfile(!showProfile)}
            onVoiceCall={() => setShowVoiceCall(true)}
          />
        ) : (
          <div className='flex-1 flex items-center justify-center bg-bg-box-chat text-gray-500'>
            Select a chat to start messaging
          </div>
        )}

        {showProfile && selectedChatId && (
          <ProfilePanel
            conversationId={selectedChatId}
            onClose={() => setShowProfile(false)}
          />
        )}

        {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}

        {showVoiceCall && selectedChatId && (
          <VoiceCallModal
            conversationId={selectedChatId}
            onClose={() => setShowVoiceCall(false)}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
