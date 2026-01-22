import { LeftNavigation } from '@/components/LeftNavigation'
import { ThemeProvider } from '@/components/ThemeProvider'
import React from 'react'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className='flex h-screen bg-bg-box-chat text-text overflow-hidden'>
        <LeftNavigation />
        {children}
      </div>
    </ThemeProvider>
  )
}

export default MainLayout
