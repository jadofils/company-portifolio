'use client'

import { useState, useEffect } from 'react'
import { cache, cacheKeys } from '@/lib/cache'

interface CompanySettings {
  company_name: string
  company_logo: string
  company_address: string
  company_phone: string
  company_email: string
  footer_description: string
  facebook_url: string
  twitter_url: string
  linkedin_url: string
  instagram_url: string
  youtube_url: string
}

export function useSettings() {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '',
    company_logo: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    footer_description: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: ''
  })
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      // Check cache first
      const cacheKey = cacheKeys.settings()
      const cached = cache.get(cacheKey)
      if (cached) {
        setSettings(cached)
        setLoading(false)
        return
      }

      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.settings) {
        setSettings(data.settings)
        cache.set(cacheKey, data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    cache.delete(cacheKeys.settings())
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()

    // Listen for settings update events
    const handleSettingsUpdate = () => {
      refreshSettings()
    }

    window.addEventListener('settingsUpdated', handleSettingsUpdate)
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate)
  }, [])

  return {
    settings,
    loading,
    refreshSettings
  }
}