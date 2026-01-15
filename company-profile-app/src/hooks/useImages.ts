import { useState, useEffect } from 'react'

interface ImageData {
  id: number
  filename: string
  original_name: string
  section: string
  subsection: string | null
  title: string | null
  file_path: string
  uploaded_at: string
}

export function useImages(section: string, subsection?: string) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<string>('')

  useEffect(() => {
    const fetchKey = `${section}-${subsection || 'none'}`
    if (fetchKey === lastFetch) return // Prevent duplicate fetches
    
    const fetchImages = async () => {
      try {
        setLoading(true)
        
        const params = new URLSearchParams()
        params.append('section', section)
        if (subsection) params.append('subsection', subsection)
        
        console.log('Fetching images with params:', { section, subsection })
        const response = await fetch(`/api/images?${params}`)
        if (!response.ok) throw new Error('Failed to fetch images')
        
        const data = await response.json()
        console.log('Received images data:', data)
        setImages(data.images || [])
        setError(null)
        setLastFetch(fetchKey)
      } catch (err) {
        console.error('Error fetching images:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch images')
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [section, subsection])

  const refreshImages = async () => {
    const fetchKey = `${section}-${subsection || 'none'}`
    
    try {
      const params = new URLSearchParams()
      params.append('section', section)
      if (subsection) params.append('subsection', subsection)
      
      const response = await fetch(`/api/images?${params}`)
      const data = await response.json()
      setImages(data.images || [])
      setLastFetch(fetchKey)
    } catch (err) {
      console.error('Error refreshing images:', err)
    }
  }

  const getFallbackImages = () => {
    return [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop"
    ]
  }

  const getImageUrls = () => {
    if (images.length > 0) {
      return images.map(img => img.file_path)
    }
    return getFallbackImages()
  }

  return {
    images,
    loading,
    error,
    imageUrls: getImageUrls(),
    hasUploadedImages: images.length > 0,
    refreshImages
  }
}