import { useEffect, useState } from 'react'
import Rail from './Rail'
import ChatPage from './ChatPage'
import FriendsPage from './FriendsPage'

type Theme = 'light' | 'dark'

const Main = () => {
  const [active, setActive] = useState<'chats' | 'friends'>('chats')
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const loadTheme = async () => {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored === 'light' || stored === 'dark') await setTheme(stored)
    }
    loadTheme()
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const shellClass =
    theme === 'dark' ? 'bg-[#0f1115] text-gray-100' : 'bg-gray-50 text-gray-900'

  return (
    <>
      <div className={`flex h-screen overflow-hidden ${shellClass}`}>
        <Rail
          active={active}
          onChange={setActive}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        {active === 'chats' ? (
          <ChatPage theme={theme} />
        ) : (
          <FriendsPage theme={theme} />
        )}
      </div>
    </>
  )
}

export default Main
