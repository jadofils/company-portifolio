'use client'

import { useState, useEffect } from 'react'

interface ContentItem {
  id: number
  section: string
  subsection: string | null
  title: string
  content: string
  image_url: string | null
  updated_at: string
}

interface UseContentReturn {
  content: ContentItem[]
  getContentBySection: (section: string, subsection?: string) => ContentItem[]
  getContentWithFallback: (section: string, subsection?: string) => ContentItem[]
  loading: boolean
  refreshContent: () => Promise<void>
}

const defaultContent = {
  about: [
    {
      id: 0,
      section: 'about',
      subsection: 'corporate-governance',
      title: 'Corporate Governance',
      content: 'Our company maintains the highest standards of corporate governance, ensuring transparency, accountability, and ethical business practices in all our operations.',
      image_url: null,
      updated_at: new Date().toISOString()
    },
    {
      id: 0,
      section: 'about',
      subsection: 'our-history',
      title: 'Our History',
      content: 'Founded with a vision to revolutionize mineral processing, we have grown from a small operation to a leading company in the industry.',
      image_url: null,
      updated_at: new Date().toISOString()
    }
  ],
  services: [
    {
      id: 0,
      section: 'services',
      subsection: 'sourcing',
      title: 'Mineral Sourcing',
      content: 'We provide comprehensive mineral sourcing services, connecting clients with high-quality mineral deposits worldwide.',
      image_url: null,
      updated_at: new Date().toISOString()
    }
  ],
  products: [
    {
      id: 0,
      section: 'products',
      subsection: 'coltan',
      title: 'Coltan',
      content: 'High-grade coltan sourced from certified mines, meeting international quality standards for electronics manufacturing.',
      image_url: null,
      updated_at: new Date().toISOString()
    }
  ],
  policies: [
    {
      id: 0,
      section: 'policies',
      subsection: 'environmental-policy',
      title: 'Environmental Policy',
      content: 'We are committed to sustainable mining practices that protect the environment and support local communities.',
      image_url: null,
      updated_at: new Date().toISOString()
    }
  ]
}

export function useContent(): UseContentReturn {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content')
      const data = await response.json()
      
      if (data.success && data.content?.length > 0) {
        setContent(data.content)
      } else {
        // Use defaults if no content in database
        const allDefaults = Object.values(defaultContent).flat()
        setContent(allDefaults)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
      // Use defaults on error
      const allDefaults = Object.values(defaultContent).flat()
      setContent(allDefaults)
    } finally {
      setLoading(false)
    }
  }

  const refreshContent = async () => {
    await fetchContent()
  }

  const getContentBySection = (section: string, subsection?: string): ContentItem[] => {
    let filtered = content.filter(item => item.section === section)
    
    if (subsection) {
      filtered = filtered.filter(item => item.subsection === subsection)
    }
    
    // Always return database content if it exists, don't fall back to defaults
    // This ensures database content overrides static content
    return filtered
  }

  // New function to get content with static fallbacks
  const getContentWithFallback = (section: string, subsection?: string): ContentItem[] => {
    let filtered = content.filter(item => item.section === section)
    
    if (subsection) {
      filtered = filtered.filter(item => item.subsection === subsection)
    }
    
    // If no content found, return defaults for that section
    if (filtered.length === 0 && defaultContent[section as keyof typeof defaultContent]) {
      const defaults = defaultContent[section as keyof typeof defaultContent]
      return subsection 
        ? defaults.filter(item => item.subsection === subsection)
        : defaults
    }
    
    return filtered
  }

  return {
    content,
    getContentBySection,
    getContentWithFallback,
    loading,
    refreshContent
  }
}