const RightPanel = ({ theme }: { theme: 'light' | 'dark' }) => {
  return (
    <aside
      className={`hidden lg:block w-80 border-l p-4 space-y-4 ${
        theme === 'dark'
          ? 'bg-[#11151c] border-[#1f2633] text-gray-100'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <div>
        <h3
          className={`text-sm font-semibold ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Thông tin nhóm
        </h3>
        <div className='mt-3 flex -space-x-2'>
          {['ffa8e4', 'ad922e', '30916c', 'b7a8ff'].map((c, i) => (
            <img
              key={i}
              src={`https://placehold.co/200x/${c}/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato`}
              alt='member'
              className='w-9 h-9 rounded-full border-2 border-white'
            />
          ))}
        </div>
      </div>
      <div>
        <h3
          className={`text-sm font-semibold ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Liên kết tham gia
        </h3>
        <div
          className={`mt-2 flex items-center justify-between rounded-md px-3 py-2 border ${
            theme === 'dark'
              ? 'bg-[#0f1115] border-[#1f2633] text-gray-200'
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}
        >
          <span className='text-xs truncate'>zalo.me/g/obelki255</span>
          <button className='text-indigo-500 text-xs font-medium'>
            Sao chép
          </button>
        </div>
      </div>
      <div>
        <h3
          className={`text-sm font-semibold ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Ghi chú
        </h3>
        <ul
          className={`mt-2 space-y-2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <li>• Danh sách nhắc hẹn</li>
          <li>• Ghi chú, ghim, bình chọn</li>
        </ul>
      </div>
      <div>
        <h3
          className={`text-sm font-semibold ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Ảnh/Video
        </h3>
        <div className='mt-2 grid grid-cols-3 gap-2'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`aspect-square rounded-md ${
                theme === 'dark' ? 'bg-[#1a1f2a]' : 'bg-gray-100'
              }`}
            ></div>
          ))}
        </div>
      </div>
      <div>
        <h3
          className={`text-sm font-semibold ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          File
        </h3>
        <div
          className={`mt-2 space-y-2 text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span>GridSearchHyperTuningParamters.pdf</span>
            <span className='text-xs text-gray-400'>2.33 MB</span>
          </div>
          <div className='flex items-center justify-between'>
            <span>Luudothuatoan.pdf</span>
            <span className='text-xs text-gray-400'>105.25 KB</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default RightPanel
