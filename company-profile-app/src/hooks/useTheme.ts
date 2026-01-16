'use client'

import { useState, useEffect, useMemo } from 'react'
import { validateThemeSettings } from '../utils/validation'

interface ThemeSettings {
  theme_mode: 'light' | 'dark'
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_size: 'small' | 'medium' | 'large'
  font_family: string
  section_spacing: 'compact' | 'normal' | 'spacious'
  border_radius: 'none' | 'small' | 'medium' | 'large'
}

const defaultTheme: ThemeSettings = {
  theme_mode: 'light',
  primary_color: '#213C51',
  secondary_color: '#6594B1',
  accent_color: '#DDAED3',
  background_color: '#EEEEEE',
  text_color: '#213C51',
  font_size: 'medium',
  font_family: 'Inter, sans-serif',
  section_spacing: 'normal',
  border_radius: 'medium'
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resetAndApplyNewTheme()
    
    // Listen for theme updates
    const handleThemeUpdate = () => {
      fetchTheme()
    }
    
    window.addEventListener('themeUpdated', handleThemeUpdate)
    
    return () => {
      window.removeEventListener('themeUpdated', handleThemeUpdate)
    }
  }, [])

  const resetAndApplyNewTheme = async () => {
    try {
      // Reset database colors to new palette
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultTheme)
      })
      
      // Apply the new theme
      setTheme(defaultTheme)
      applyThemeToDocument(defaultTheme)
    } catch (error) {
      // console.error('Failed to reset theme:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTheme = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.settings) {
        const validatedSettings = validateThemeSettings(data.settings)
        const themeSettings: ThemeSettings = {
          theme_mode: validatedSettings.theme_mode || defaultTheme.theme_mode,
          primary_color: validatedSettings.primary_color,
          secondary_color: validatedSettings.secondary_color,
          accent_color: validatedSettings.accent_color,
          background_color: validatedSettings.background_color,
          text_color: validatedSettings.text_color,
          font_size: validatedSettings.font_size || defaultTheme.font_size,
          font_family: validatedSettings.font_family,
          section_spacing: validatedSettings.section_spacing || defaultTheme.section_spacing,
          border_radius: validatedSettings.border_radius || defaultTheme.border_radius
        }
        setTheme(themeSettings)
        applyThemeToDocument(themeSettings)
      }
    } catch (error) {
      // console.error('Failed to fetch theme:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyThemeToDocument = (themeSettings: ThemeSettings) => {
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', themeSettings.primary_color)
    root.style.setProperty('--secondary-color', themeSettings.secondary_color)
    root.style.setProperty('--accent-color', themeSettings.accent_color)
    root.style.setProperty('--background-color', themeSettings.background_color)
    root.style.setProperty('--text-color', themeSettings.text_color)
    root.style.setProperty('--font-family', themeSettings.font_family)
    
    // Font size
    const fontSize = themeSettings.font_size === 'small' ? '14px' : 
                    themeSettings.font_size === 'large' ? '18px' : '16px'
    root.style.setProperty('--base-font-size', fontSize)
    
    // Section spacing
    const spacing = themeSettings.section_spacing === 'compact' ? '60px' :
                   themeSettings.section_spacing === 'spacious' ? '120px' : '80px'
    root.style.setProperty('--section-spacing', spacing)
    
    // Border radius
    const borderRadius = themeSettings.border_radius === 'none' ? '0' :
                        themeSettings.border_radius === 'small' ? '4px' :
                        themeSettings.border_radius === 'large' ? '12px' : '8px'
    root.style.setProperty('--border-radius', borderRadius)
    
    // Theme mode
    if (themeSettings.theme_mode === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--background-color', '#1f2937')
      root.style.setProperty('--text-color', '#f9fafb')
    } else {
      root.classList.remove('dark')
    }
  }

  const refreshTheme = async () => {
    await fetchTheme()
  }

  const getThemeClasses = useMemo(() => {
    const isDark = theme.theme_mode === 'dark'
    return {
      // Colors - Navy Blue Pink Grey Vintage Kids Pastel Theme
      primary: `text-[#213C51]`,
      primaryBg: `bg-primary`,
      secondary: `text-[#6594B1]`,
      secondaryBg: `bg-secondary`,
      accent: `text-[#DDAED3]`,
      accentBg: `bg-accent`,
      background: `bg-theme`,
      text: `text-[#213C51]`,
      
      // Layout
      spacing: theme.section_spacing === 'compact' ? 'py-12' : 
               theme.section_spacing === 'spacious' ? 'py-32' : 'py-20',
      radius: theme.border_radius === 'none' ? 'rounded-none' :
              theme.border_radius === 'small' ? 'rounded-sm' :
              theme.border_radius === 'large' ? 'rounded-xl' : 'rounded-lg',
      
      // Typography
      fontFamily: `font-[var(--font-family)]`,
      fontSize: theme.font_size === 'small' ? 'text-sm' :
                theme.font_size === 'large' ? 'text-lg' : 'text-base',
      
      // Common UI elements
      card: `bg-white border border-[#DDAED3]`,
      input: `bg-white border border-[#DDAED3] text-[#213C51] focus:border-[#213C51]`,
      button: `bg-white hover:bg-gray-50 text-[#213C51] border border-[#DDAED3]`,
      buttonPrimary: `button-primary`,
      textPrimary: `text-[#213C51]`,
      textSecondary: `text-[#6594B1]`,
      textMuted: `text-[#6594B1]`,
      
      // Navigation
      navBg: `bg-white`,
      navText: `text-[#213C51]`,
      navTextHover: `hover:text-[#6594B1]`,
      
      // Forms
      formBg: `bg-white`,
      formBorder: `border-[#DDAED3]`,
      formText: `text-[#213C51]`,
      formLabel: `text-[#213C51]`,
      formPlaceholder: `placeholder-[#6594B1]`
    }
  }, [theme])

  return {
    theme,
    loading,
    refreshTheme,
    getThemeClasses,
    applyThemeToDocument
  }
}