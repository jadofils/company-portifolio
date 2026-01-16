'use client'

import './globals.css'
import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, loading } = useTheme()

  useEffect(() => {
    // Apply theme styles to document
    const root = document.documentElement
    root.style.fontFamily = theme.font_family
    
    const fontSize = theme.font_size === 'small' ? '14px' : 
                    theme.font_size === 'large' ? '18px' : '16px'
    root.style.fontSize = fontSize
    
    if (theme.theme_mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-200 ${
        theme.theme_mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
      style={{
        fontFamily: theme.font_family,
        fontSize: theme.font_size === 'small' ? '14px' : theme.font_size === 'large' ? '18px' : '16px'
      }}
    >
      {children}
    </div>
  )
}