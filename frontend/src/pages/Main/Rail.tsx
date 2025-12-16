import React from 'react'

type RailProps = {
  active: 'chats' | 'friends'
  onChange: (v: 'chats' | 'friends') => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const Rail = ({ active, onChange, theme, onToggleTheme }: RailProps) => {
  const Item = ({
    id,
    title,
    icon,
  }: {
    id: 'chats' | 'friends'
    title: string
    icon: React.ReactNode
  }) => (
    <button
      onClick={() => onChange(id)}
      title={title}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
        active === id
          ? 'bg-indigo-600 text-white'
          : theme === 'dark'
          ? 'text-gray-400 hover:bg-white/10'
          : 'text-gray-400 hover:bg-gray-100'
      }`}
    >
      {icon}
    </button>
  )

  return (
    <aside
      className={`w-14 border-r flex flex-col items-center gap-2 py-2 ${
        theme === 'dark'
          ? 'bg-[#0f1115] border-[#1c1f26]'
          : 'bg-white border-gray-200'
      }`}
    >
      <Item
        id='chats'
        title='Tin nhắn'
        icon={
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path d='M21 12a9 9 0 11-3.084-6.716l.826-.826a.75.75 0 111.06 1.06l-.826.827A9 9 0 0121 12zM7.5 9.75h9a.75.75 0 010 1.5h-9a.75.75 0 010-1.5zm0 3h6a.75.75 0 010 1.5h-6a.75.75 0 010-1.5z' />
          </svg>
        }
      />
      <Item
        id='friends'
        title='Bạn bè'
        icon={
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path d='M15 8.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' />
            <path d='M3 20.25a7.5 7.5 0 0115 0v.75H3v-.75z' />
          </svg>
        }
      />
      <div className='flex-1' />
      <button
        onClick={onToggleTheme}
        title='Bật/tắt dark mode'
        className={`w-10 h-10 mb-1 flex items-center justify-center rounded-xl transition-colors ${
          theme === 'dark'
            ? 'bg-white/10 text-yellow-300 hover:bg-white/20'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {theme === 'dark' ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path d='M21.752 15.002A9.718 9.718 0 0112 21.75 9.75 9.75 0 1118.998 2.248 8.25 8.25 0 0021.752 15z' />
          </svg>
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path d='M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM4.72 4.72a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06l-1.59-1.59a.75.75 0 010-1.06zM16.63 16.63a.75.75 0 011.06 0l1.59 1.59a.75.75 0 11-1.06 1.06l-1.59-1.59a.75.75 0 010-1.06zM2.25 12a.75.75 0 01.75-.75H5.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM18.75 12a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM4.72 19.28a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM16.63 7.37a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z' />
          </svg>
        )}
      </button>
    </aside>
  )
}

export default Rail
