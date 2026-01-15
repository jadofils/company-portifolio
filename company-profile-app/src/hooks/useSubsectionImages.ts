import { useState, useEffect } from 'react'
import { cache, cacheKeys } from '@/lib/cache'

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

interface SubsectionImageMap {
  [key: string]: string | null // subsection -> image_url
}

export function useSubsectionImages(section: string, subsections: string[]) {
  const [subsectionImages, setSubsectionImages] = useState<SubsectionImageMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubsectionImages = async () => {
      try {
        setLoading(true)
        
        // Check cache first
        const cacheKey = cacheKeys.images(section)
        let allSectionImages: ImageData[] = cache.get(cacheKey)
        
        if (!allSectionImages) {
          // Fetch all images for the section
          const response = await fetch(`/api/images?section=${section}`)
          if (!response.ok) throw new Error('Failed to fetch images')
          
          const data = await response.json()
          allSectionImages = data.images || []
          
          // Cache the results
          cache.set(cacheKey, allSectionImages)
        }
        
        // Create subsection image map
        const imageMap: SubsectionImageMap = {}
        subsections.forEach(subsection => {
          const subsectionImage = allSectionImages.find(img => img.subsection === subsection)
          imageMap[subsection] = subsectionImage ? subsectionImage.file_path : null
        })
        
        setSubsectionImages(imageMap)
      } catch (error) {
        console.error('Error fetching subsection images:', error)
        // Set empty map on error
        const emptyMap: SubsectionImageMap = {}
        subsections.forEach(subsection => {
          emptyMap[subsection] = null
        })
        setSubsectionImages(emptyMap)
      } finally {
        setLoading(false)
      }
    }

    if (subsections.length > 0) {
      fetchSubsectionImages()
    }
  }, [section, subsections.join(',')])

  const getSubsectionImage = (subsection: string): string | null => {
    return subsectionImages[subsection] || null
  }

  return {
    subsectionImages,
    getSubsectionImage,
    loading
  }
}