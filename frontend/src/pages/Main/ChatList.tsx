type Item = { name: string; msg: string; avatar: string; unread?: number }

const ChatList = ({
  items,
  theme,
}: {
  items: Item[]
  theme: 'light' | 'dark'
}) => {
  return (
    <div
      className={`w-72 border-r flex flex-col ${
        theme === 'dark'
          ? 'bg-[#11151c] border-[#1f2633] text-gray-100'
          : 'bg-white border-gray-200'
      }`}
    >
      <header
        className={`p-4 border-b bg-indigo-600 text-white ${
          theme === 'dark' ? 'border-[#1f2633]' : 'border-gray-200'
        }`}
      >
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold'>Chat Web</h1>
          <button className='p-2 rounded hover:bg-white/10' title='New chat'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='w-5 h-5'
            >
              <path d='M12 4.5a.75.75 0 01.75.75V11h5.75a.75.75 0 010 1.5H12.75v5.75a.75.75 0 01-1.5 0V12.5H5.5a.75.75 0 010-1.5h5.75V5.25A.75.75 0 0112 4.5z' />
            </svg>
          </button>
        </div>
        <div className='mt-3 flex gap-2'>
          <button className='px-3 py-1.5 rounded-full text-sm bg:white bg-white/20'>
            Tất cả
          </button>
          <button className='px-3 py-1.5 rounded-full text-sm hover:bg-white/10'>
            Chưa đọc
          </button>
        </div>
        <div className='mt-3 relative'>
          <input
            className={`w-full rounded-full px-10 py-2 outline-none ${
              theme === 'dark'
                ? 'bg-[#0f1115] text-gray-100 placeholder-gray-500'
                : 'bg-white/95 text-gray-700 placeholder-gray-400'
            }`}
            placeholder='Tìm kiếm'
          />
          <svg
            className={`absolute left-3 top-2.5 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 101.5 9a7.5 7.5 0 0015.15 7.65z'
            />
          </svg>
        </div>
      </header>
      <div className='overflow-y-auto p-2 space-y-1'>
        {items.map((c) => (
          <div
            key={c.name}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
              theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'
            }`}
          >
            <img
              src={c.avatar}
              className='w-11 h-11 rounded-full'
              alt={c.name}
            />
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <p
                  className={`font-medium truncate ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {c.name}
                </p>
                {c.unread ? (
                  <span className='ml-2 text-[11px] bg-indigo-600 text-white rounded-full px-1.5 py-0.5'>
                    {c.unread}
                  </span>
                ) : null}
              </div>
              <p
                className={`text-sm truncate ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                {c.msg}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatList
