import { useState, useEffect } from 'react'

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

const defaultSettings: CompanySettings = {
  company_name: 'MineralsCorp',
  company_logo: '/logo.png',
  company_address: '123 Mining District\nKigali, Rwanda',
  company_phone: '+250 788 123 456',
  company_email: 'info@mineralscorp.com',
  footer_description: 'Leading mineral processing company specializing in sustainable mining practices and high-quality mineral extraction.',
  facebook_url: '#',
  twitter_url: '#',
  linkedin_url: '#',
  instagram_url: '#',
  youtube_url: '#'
}

export function useSettings() {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings({ ...defaultSettings, ...data.settings })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) throw new Error('Failed to update settings')
      
      setSettings(prev => ({ ...prev, ...newSettings }))
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update settings' 
      }
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  }
}