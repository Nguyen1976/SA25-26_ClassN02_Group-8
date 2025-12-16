import ChatList from './ChatList'
import RightPanel from './RightPanel'
import InComeMessage from './InComeMessage'
import OutMessage from './OutMessage'

type ChatPageProps = {
  theme: 'light' | 'dark'
}

const ChatPage = ({ theme }: ChatPageProps) => {
  const chatItems = [
    {
      name: 'Alice',
      msg: 'Hoorayy!!',
      avatar:
        'https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
      unread: 2,
    },
    {
      name: 'Martin',
      msg: 'Pizza was amazing 🍕',
      avatar:
        'https://placehold.co/200x/ad922e/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
      unread: 0,
    },
    {
      name: 'Jack',
      msg: "Can't stop laughing!",
      avatar:
        'https://placehold.co/200x/30916c/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
      unread: 1,
    },
  ]

  const surface = theme === 'dark' ? 'bg-[#0f1115]' : 'bg-gray-50'

  return (
    <div className={`flex h-screen overflow-hidden flex-1 ${surface}`}>
      <ChatList items={chatItems} theme={theme} />

      <div className='flex-1 relative flex flex-col min-w-0'>
        <header
          className={`border-b px-4 py-3 flex items-center justify-between ${
            theme === 'dark'
              ? 'bg-[#11151c] border-[#1f2633] text-gray-100'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <div>
            <h2
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}
            >
              NCKH_1_2025_2026_GRAP...
            </h2>
            <p
              className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              4 thành viên • Liên kết nhóm
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              className={`p-2 rounded ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title='Tìm kiếm'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 101.5 9a7.5 7.5 0 0015.15 7.65z'
                />
              </svg>
            </button>
            <button
              className={`p-2 rounded ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title='Gọi thoại'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-5 h-5'
              >
                <path d='M2.25 6.75A2.25 2.25 0 014.5 4.5h3.586a2.25 2.25 0 011.59.659l2.915 2.915a2.25 2.25 0 010 3.182l-1.06 1.06a.75.75 0 000 1.06l3.54 3.54a.75.75 0 001.06 0l1.06-1.06a2.25 2.25 0 013.182 0l2.915 2.915c.42.42.659.99.659 1.59V19.5A2.25 2.25 0 0121.75 21.75h-1.5a18.75 18.75 0 01-18-18v-1.5z' />
              </svg>
            </button>
            <button
              className={`p-2 rounded ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title='Gọi video'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-5 h-5'
              >
                <path d='M15.75 7.5A2.25 2.25 0 0118 9.75v4.5A2.25 2.25 0 0115.75 16.5H6.75A2.25 2.25 0 014.5 14.25v-4.5A2.25 2.25 0 016.75 7.5h9z' />
                <path d='M19.5 8.25l3.75-1.5v10.5l-3.75-1.5v-7.5z' />
              </svg>
            </button>
            <button
              className={`p-2 rounded ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title='Thêm'
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
          </div>
        </header>

        <div
          className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          <div
            className={`text-sm px-3 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-blue-900/40 border border-blue-900/60 text-blue-100'
                : 'bg-blue-50 border border-blue-100 text-blue-700'
            }`}
          >
            Nhớ họp lúc 8pm thứ 4 (17/12) dùng link ở đầu nhóm.
          </div>
          <div className='flex items-center gap-3 py-2'>
            <div
              className={`flex-1 h-px ${
                theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'
              }`}
            ></div>
            <span
              className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              Hôm nay
            </span>
            <div
              className={`flex-1 h-px ${
                theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'
              }`}
            ></div>
          </div>
          <InComeMessage
            theme={theme}
            name='Nguyễn Lệ Thu'
            text='Mình online meeting thứ 5 này nhé'
            time='11:09'
            reactions={[{ emoji: '❤️', count: 3 }]}
          />
          <InComeMessage
            theme={theme}
            text='Vậy mình online meeting lúc 8pm, ngày 17/12 nhé'
            time='11:22'
          />
          <OutMessage
            theme={theme}
            text='Dạ vâng ạ'
            time='11:22'
            reactions={[{ emoji: '👍', count: 1 }]}
          />
          <InComeMessage
            theme={theme}
            name='Quân CNTT4'
            text='Vâng ạ'
            time='Hôm nay 12:38'
            reactions={[{ emoji: '❤️', count: 1 }]}
          />
        </div>

        <footer
          className={`border-t px-3 py-3 ${
            theme === 'dark'
              ? 'bg-[#11151c] border-[#1f2633] text-gray-100'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <div className='flex items-center gap-2'>
            <button
              className={`p-2 rounded ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title='Đính kèm'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-5 h-5 text-gray-600'
              >
                <path d='M18.364 5.636a4.5 4.5 0 00-6.364 0L4.5 13.136a3 3 0 104.243 4.243l6.01-6.01a1.5 1.5 0 00-2.121-2.122L7.5 14.378' />
              </svg>
            </button>
            <div
              className={`flex-1 flex items-center rounded-full px-3 ${
                theme === 'dark' ? 'bg-[#1a1f2a]' : 'bg-gray-100'
              }`}
            >
              <input
                type='text'
                placeholder='Nhập tin nhắn...'
                className={`flex-1 bg-transparent py-2 outline-none ${
                  theme === 'dark'
                    ? 'text-gray-100 placeholder-gray-500'
                    : 'text-gray-800'
                }`}
              />
              <button
                className={`p-2 rounded ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                }`}
                title='Biểu tượng'
              >
                <span>😊</span>
              </button>
              <button
                className={`p-2 rounded ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-200'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
                title='Ghi âm'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5 text-gray-600'
                >
                  <path d='M12 3.75a3 3 0 00-3 3v6a3 3 0 006 0v-6a3 3 0 00-3-3z' />
                  <path d='M5.25 12a.75.75 0 011.5 0 5.25 5.25 0 0010.5 0 .75.75 0 011.5 0 6.75 6.75 0 01-6 6.708V21h2.25a.75.75 0 010 1.5H9.75a.75.75 0 010-1.5H12v-2.292A6.75 6.75 0 015.25 12z' />
                </svg>
              </button>
            </div>
            <button className='bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-500'>
              Gửi
            </button>
          </div>
        </footer>
      </div>

      <RightPanel theme={theme} />
    </div>
  )
}

export default ChatPage
