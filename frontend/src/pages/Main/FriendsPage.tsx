type FriendsPageProps = { theme: 'light' | 'dark' }

const SideMenu = ({ theme }: { theme: 'light' | 'dark' }) => {
  const items = [
    { label: 'Danh sách bạn bè' },
    { label: 'Danh sách nhóm và cộng đồng' },
    { label: 'Lời mời kết bạn' },
    { label: 'Lời mời vào nhóm và cộng đồng' },
  ]
  return (
    <aside
      className={`w-64 h-screen p-3 space-y-1 hidden md:block ${
        theme === 'dark'
          ? 'bg-[#17191d] text-gray-300'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            i === 0
              ? theme === 'dark'
                ? 'bg-[#23262d] text-white'
                : 'bg-white shadow text-gray-900'
              : theme === 'dark'
              ? 'hover:bg-[#1e2127]'
              : 'hover:bg-white'
          }`}
        >
          <div className='w-6 h-6 rounded-full bg-gray-600/40'></div>
          <span className='text-sm'>{it.label}</span>
        </div>
      ))}
    </aside>
  )
}

const FriendRow = ({
  name,
  avatar,
  theme,
}: {
  name: string
  avatar: string
  theme: 'light' | 'dark'
}) => (
  <div
    className={`flex items-center gap-3 px-3 py-2 rounded-md ${
      theme === 'dark' ? 'hover:bg-gray-800/20' : 'hover:bg-gray-100'
    }`}
  >
    <img src={avatar} className='w-10 h-10 rounded-full' alt={name} />
    <div className={theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
      {name}
    </div>
    <div
      className={`ml-auto ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
      }`}
    >
      <button
        className={`p-1.5 rounded-md ${
          theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-200'
        }`}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='w-5 h-5'
        >
          <path d='M12 6.75a.75.75 0 01.75.75v3.75H16.5a.75.75 0 010 1.5h-3.75V16.5a.75.75 0 01-1.5 0v-3.75H7.5a.75.75 0 010-1.5h3.75V7.5a.75.75 0 01.75-.75z' />
        </svg>
      </button>
      <button
        className={`p-1.5 rounded-md ${
          theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-200'
        }`}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='w-5 h-5'
        >
          <path d='M6.75 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM13.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM21.75 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
        </svg>
      </button>
    </div>
  </div>
)

const FriendsPage = ({ theme }: FriendsPageProps) => {
  const friends = [
    {
      group: 'A',
      list: [
        'A Hà Nhà Trọ Phenikaa',
        'A Phú',
        'Anh Anh Bg',
        'Anh Luân',
        'Anh Tường',
      ],
    },
    {
      group: 'B',
      list: [
        'Bá Duy Vận Hành Tabcom Care',
        'Bảo Ngọc',
        'Bìnhminh',
        'Bố',
        'Bùi Anh Quốc',
      ],
    },
  ]

  const surface =
    theme === 'dark' ? 'bg-[#0f1115] text-white' : 'bg-gray-50 text-gray-900'

  return (
    <div className={`flex h-screen flex-1 ${surface}`}>
      <SideMenu theme={theme} />
      <main className='flex-1 px-6 py-5'>
        <header className='flex items-center justify-between'>
          <h1 className='text-lg font-semibold'>Danh sách bạn bè</h1>
          <div className='flex items-center gap-2'>
            <select
              className={`text-sm px-3 py-2 rounded-md border border-transparent ${
                theme === 'dark'
                  ? 'bg-[#1a1d23] text-gray-300 hover:border-gray-600'
                  : 'bg-white text-gray-700 shadow hover:border-gray-200'
              }`}
            >
              <option>Tên (A-Z)</option>
              <option>Tên (Z-A)</option>
            </select>
            <select
              className={`text-sm px-3 py-2 rounded-md border border-transparent ${
                theme === 'dark'
                  ? 'bg-[#1a1d23] text-gray-300 hover:border-gray-600'
                  : 'bg-white text-gray-700 shadow hover:border-gray-200'
              }`}
            >
              <option>Tất cả</option>
              <option>Đang online</option>
            </select>
          </div>
        </header>

        <div className='mt-4 relative'>
          <input
            className={`w-full rounded-md px-10 py-2 outline-none ${
              theme === 'dark'
                ? 'bg-[#1a1d23] text-gray-200 placeholder-gray-500'
                : 'bg-white text-gray-800 placeholder-gray-500 shadow'
            }`}
            placeholder='Tìm bạn'
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

        <section className='mt-4 space-y-6'>
          {friends.map((g) => (
            <div key={g.group}>
              <div
                className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {g.group}
              </div>
              <div
                className={`rounded-md divide-y ${
                  theme === 'dark'
                    ? 'bg-[#14171d] divide-gray-800/60'
                    : 'bg-white divide-gray-100 shadow'
                }`}
              >
                {g.list.map((name) => (
                  <FriendRow
                    key={name}
                    name={name}
                    avatar='https://placehold.co/200x/2a2f3a/ffffff.svg?text=🙂&font=Lato'
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default FriendsPage
