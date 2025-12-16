type Reaction = { emoji: string; count?: number }
type OutMessageProps = {
  avatarUrl?: string
  text?: string
  time?: string
  reactions?: Reaction[]
  status?: 'sent' | 'delivered' | 'seen'
  theme?: 'light' | 'dark'
}

const OutMessage = ({
  avatarUrl = 'https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
  text = "Hi Alice! I'm good, just finished a great book. How about you?",
  time = '12:38',
  reactions = [],
  status = 'seen',
  theme = 'light',
}: OutMessageProps) => {
  const bubble =
    theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
  const reactionBg =
    theme === 'dark'
      ? 'bg-indigo-500/40 border-indigo-400/40'
      : 'bg-indigo-400/30 border-indigo-300/40'
  const timeColor = theme === 'dark' ? 'text-indigo-100' : 'text-indigo-100'
  const moreColor =
    theme === 'dark'
      ? 'text-gray-500 hover:text-gray-300'
      : 'text-gray-400 hover:text-gray-600'
  return (
    <div className='group flex justify-end items-end gap-2 mb-3'>
      <button
        className={`opacity-0 group-hover:opacity-100 transition p-1 rounded order-1 ${moreColor}`}
        title='More'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='w-4 h-4'
        >
          <path d='M6.75 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM13.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM21.75 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
        </svg>
      </button>
      <div className='order-2'>
        <div
          className={`relative max-w-[70%] rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm ${bubble}`}
        >
          <p className='leading-relaxed'>{text}</p>
          <div className='mt-1 flex items-center gap-2'>
            <span className={`text-[11px] ${timeColor}`}>{time}</span>
            {reactions.length ? (
              <div
                className={`flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 ${reactionBg}`}
              >
                {reactions.map((r, i) => (
                  <span key={i} className='flex items-center gap-1'>
                    <span>{r.emoji}</span>
                    {r.count ? <span>{r.count}</span> : null}
                  </span>
                ))}
              </div>
            ) : null}
            <span className={`text-[11px] ${timeColor}`}>
              {status === 'seen'
                ? 'Đã xem'
                : status === 'delivered'
                ? 'Đã nhận'
                : 'Đã gửi'}
            </span>
          </div>
          <span
            className={`absolute -right-1 top-2 w-2 h-2 rotate-45 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500'
            }`}
          ></span>
        </div>
      </div>
      <img
        src={avatarUrl}
        alt='My Avatar'
        className='w-8 h-8 rounded-full order-3'
      />
    </div>
  )
}

export default OutMessage
