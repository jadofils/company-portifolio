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
  const [activeSection, setActiveSection] = useState('corporate-governance')
  const { imageUrls } = useImages('about')

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

  // Combine static sections with dynamic content - show all static plus new dynamic ones
  const allSections = [
    ...staticSections,
    ...aboutContent.filter(item => !staticSections.some(s => s.title === item.title)).map(item => ({
      id: item.subsection || item.title.toLowerCase().replace(/\s+/g, '-'),
      title: item.title
    }))
  ]

  const getCurrentContent = (sectionId: string) => {
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

  return (
    <section id="about" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-[85vh] bg-gray-100 relative flex items-center justify-center" style={{
        backgroundImage: imageUrls[0] ? `url("${imageUrls[0]}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!imageUrls[0] && <Building className="h-24 w-24 text-gray-400" />}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full h-full bg-black/30 flex items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold text-white">About Us</h2>
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
                {currentContent?.image_url && (
                  <div className="mt-6">
                    <img 
                      src={currentContent.image_url} 
                      alt={currentContent.title}
                      className="w-full h-[85vh] object-cover rounded"
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