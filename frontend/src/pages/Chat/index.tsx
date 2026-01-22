import { useState } from 'react'
import { ChatSidebar } from '@/components/ChatSidebar'
import ChatWindow from '@/components/ChatWindow'
import ProfilePanel from '@/components/ProfilePanel'
import VoiceCallModal from '@/components/VoiceCallModal'
import MainLayout from '@/layouts/MainLayout'
import { useParams } from 'react-router'

export default function ChatPage() {
  const [showProfile, setShowProfile] = useState(false)
  const [showVoiceCall, setShowVoiceCall] = useState(false)

  const selectedChatId = useParams().conversationId || ''
  return (
    <MainLayout>
      <ChatSidebar />

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

      {showVoiceCall && selectedChatId && (
        <VoiceCallModal
          conversationId={selectedChatId}
          onClose={() => setShowVoiceCall(false)}
        />
      )}
    </MainLayout>
  )
}
