'use client'

import { useState, useEffect } from 'react'
import { useImages } from '@/hooks/useImages'
import { useContent } from '@/hooks/useContent'
import { Building } from 'lucide-react'

type AboutSectionKey =
  | 'corporate-governance'
  | 'our-history'
  | 'leadership-team'
  | 'mission-vision'
  | 'sustainability'

const AboutSection = () => {
  const { getContentBySection } = useContent()
  const aboutContent = getContentBySection('about')
  const [activeSection, setActiveSection] = useState('about')
  const { images: aboutImages, refreshImages: refreshAboutImages } = useImages('about')
  const { images: subsectionImages, refreshImages: refreshSubsectionImages } = useImages('about', activeSection === 'about' ? undefined : activeSection)

  // Static fallback content
  const staticContent: Record<string, { title: string; content: string }> = {
    'corporate-governance': {
      title: 'Corporate Governance',
      content: `MineralsCorp maintains the highest standards of corporate governance to ensure transparency, 
      accountability, and ethical business practices. Our governance framework is designed to protect 
      stakeholder interests while promoting sustainable growth and operational excellence.
      
      Our Board of Directors provides strategic oversight and ensures compliance with all regulatory 
      requirements. We have established comprehensive policies covering risk management, internal controls, 
      and ethical conduct that guide our operations across all jurisdictions.`
    },
    'our-history': {
      title: 'Our History',
      content: `Founded in 1990, MineralsCorp has established itself as a leading mineral processing company 
      with operations spanning multiple continents. Our commitment to sustainable practices and technological 
      innovation has driven continuous growth while maintaining the highest environmental and safety standards.`
    },
    'leadership-team': {
      title: 'Leadership Team',
      content: `Our experienced leadership team brings together decades of industry expertise and strategic vision. 
      Led by seasoned professionals with deep knowledge of global mining operations, our team is committed 
      to driving innovation and sustainable growth.`
    },
    'mission-vision': {
      title: 'Mission & Vision',
      content: `Our mission is to be the leading provider of sustainable mineral processing solutions while 
      maintaining the highest standards of environmental responsibility and community engagement. We envision 
      a future where mining operations contribute positively to global development and environmental stewardship.`
    },
    'sustainability': {
      title: 'Sustainability',
      content: `Sustainability is at the core of our operations. We are committed to responsible mining practices 
      that minimize environmental impact while maximizing positive outcomes for local communities. Our 
      comprehensive sustainability program covers environmental protection, social responsibility, and economic development.`
    }
  }

  const staticSections = [
    { id: 'corporate-governance', title: 'Corporate Governance' },
    { id: 'our-history', title: 'Our History' },
    { id: 'leadership-team', title: 'Leadership Team' },
    { id: 'mission-vision', title: 'Mission & Vision' },
    { id: 'sustainability', title: 'Sustainability' }
  ]

  // Combine static sections with dynamic content - show main about first, then subsections
  const allSections = [
    { id: 'about', title: 'About Us' },
    ...staticSections,
    ...aboutContent.filter(item => !staticSections.some(s => s.title === item.title)).map(item => ({
      id: item.subsection || item.title.toLowerCase().replace(/\s+/g, '-'),
      title: item.title
    }))
  ]

  const getCurrentContent = (sectionId: string) => {
    // If main about section, return general about info
    if (sectionId === 'about') {
      return {
        title: 'About Us',
        content: 'Welcome to our company. Learn more about our corporate governance, history, leadership team, mission & vision, and sustainability initiatives.',
        image_url: null
      }
    }
    
    // First check if it's dynamic content
    const dynamicContent = aboutContent.find(item => 
      (item.subsection === sectionId) || 
      (item.title.toLowerCase().replace(/\s+/g, '-') === sectionId)
    )
    if (dynamicContent) return dynamicContent
    
    // Otherwise use static content
    return staticContent[sectionId] ? {
      title: staticContent[sectionId].title,
      content: staticContent[sectionId].content,
      image_url: null
    } : null
  }

  const currentContent = getCurrentContent(activeSection)
  
  // Get the appropriate image for current section/subsection
  const getCurrentImage = () => {
    console.log('getCurrentImage called with activeSection:', activeSection)
    console.log('aboutImages:', aboutImages)
    console.log('subsectionImages:', subsectionImages)
    
    // If main about section, use general about images (where subsection is null)
    if (activeSection === 'about') {
      const mainAboutImages = aboutImages.filter(img => img.subsection === null || img.subsection === '')
      console.log('mainAboutImages:', mainAboutImages)
      if (mainAboutImages && mainAboutImages.length > 0) {
        return mainAboutImages[0].file_path
      }
      // Fallback to static image for main about section
      return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'
    }
    
    // For subsections, try subsection-specific images first
    console.log('Looking for subsection images for:', activeSection)
    if (subsectionImages && subsectionImages.length > 0) {
      console.log('Found subsection images:', subsectionImages)
      return subsectionImages[0].file_path
    }
    
    // Then try content image_url from database content
    if (currentContent?.image_url) {
      console.log('Using content image_url:', currentContent.image_url)
      return currentContent.image_url
    }
    
    // Static fallback images for each subsection
    const staticImages = {
      'corporate-governance': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      'our-history': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'leadership-team': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      'mission-vision': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      'sustainability': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
    }
    
    if (staticImages[activeSection as keyof typeof staticImages]) {
      console.log('Using static fallback image for:', activeSection)
      return staticImages[activeSection as keyof typeof staticImages]
    }
    
    // Finally try general about section images as fallback
    const mainAboutImages = aboutImages.filter(img => img.subsection === null || img.subsection === '')
    if (mainAboutImages && mainAboutImages.length > 0) {
      console.log('Using fallback main about image:', mainAboutImages[0].file_path)
      return mainAboutImages[0].file_path
    }
    
    // Final fallback to static about image
    console.log('Using final static fallback')
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'
  }

  // Listen for subsection change events from navbar
  useEffect(() => {
    const handleSubsectionChange = (event: CustomEvent) => {
      if (event.detail.section === 'about') {
        setActiveSection(event.detail.subsection)
      }
    }
    
    window.addEventListener('changeSubsection', handleSubsectionChange as EventListener)
    return () => window.removeEventListener('changeSubsection', handleSubsectionChange as EventListener)
  }, [])

  // Refresh images when activeSection changes
  useEffect(() => {
    if (activeSection === 'about') {
      refreshAboutImages()
    } else {
      refreshSubsectionImages()
    }
  }, [activeSection])

  const currentImage = getCurrentImage()

  return (
    <section id="about" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-[85vh] bg-gray-100 relative flex items-center justify-center" style={{
        backgroundImage: currentImage ? `url("${currentImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!currentImage && <Building className="h-24 w-24 text-gray-400" />}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full h-full bg-black/30 flex items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold text-white">{currentContent?.title || 'About Us'}</h2>
        </div>
      </div>
      
      <div className="py-20">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h3 className="font-bold text-gray-900 mb-4">About Sections</h3>
                <ul className="space-y-2">
                  {allSections.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors border-b-2 ${
                          activeSection === item.id
                            ? 'bg-blue-100 text-blue-900 font-medium border-blue-500'
                            : 'text-gray-600 hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentContent?.title}
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {currentContent?.content}
                </div>
                {/* Show additional subsection image if different from hero */}
                {currentContent?.image_url && currentContent.image_url !== currentImage && (
                  <div className="mt-6">
                    <img 
                      src={currentContent.image_url} 
                      alt={currentContent.title}
                      className="w-full h-[60vh] object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection