'use client'

import { useState, useEffect } from 'react'
import { Search, FlaskConical, Hammer, Tag, Package, Truck, Ship, ArrowRight, Cog, ChevronDown, ChevronUp } from 'lucide-react'
import { useImages } from '@/hooks/useImages'
import { useContent } from '@/hooks/useContent'
import { useTheme } from '@/hooks/useTheme'

type ServiceSectionKey =
  | 'sourcing'
  | 'testing-analysis'
  | 'crushing'
  | 'tagging'
  | 'packing'
  | 'loading'
  | 'shipping'

const ServicesSection = () => {
  const [activeSection, setActiveSection] = useState('services')
  const [showAllSections, setShowAllSections] = useState(false)
  const { images: servicesImages, refreshImages: refreshServicesImages } = useImages('services')
  const { images: subsectionImages, refreshImages: refreshSubsectionImages } = useImages('services', activeSection === 'services' ? undefined : activeSection)
  const { getContentBySection } = useContent()
  const servicesContent = getContentBySection('services')
  const { getThemeClasses } = useTheme()
  const themeClasses = getThemeClasses

  const serviceSections: { id: ServiceSectionKey; title: string }[] = [
    { id: 'sourcing', title: 'Sourcing' },
    { id: 'testing-analysis', title: 'Testing & Analysis' },
    { id: 'crushing', title: 'Crushing' },
    { id: 'tagging', title: 'Tagging' },
    { id: 'packing', title: 'Packing' },
    { id: 'loading', title: 'Loading' },
    { id: 'shipping', title: 'Shipping' }
  ]

  const staticContent: Record<ServiceSectionKey, { title: string; content: string; icon: JSX.Element }> = {
    'sourcing': {
      title: 'Sourcing',
      content: `Our sourcing operations are built on close and persistent contact with artisanal miners and mining companies across the region. We focus on establishing reliable supply chains for raw minerals while ensuring ethical sourcing practices.
      
      Our team works directly with local mining communities to secure consistent mineral supplies. We maintain strict quality standards from the point of extraction and provide fair compensation to our mining partners.`,
      icon: <Search className="h-8 w-8" />
    },
    'testing-analysis': {
      title: 'Testing & Analysis',
      content: `We utilize advanced Spectrum Analyzer technology to conduct comprehensive mineral analysis. Each batch undergoes rigorous testing to determine exact mineral composition and purity levels.
      
      Our laboratory produces detailed Analysis Certificates that include complete mineral information, chemical composition, and quality grades. This ensures our clients receive accurate specifications for their industrial applications.`,
      icon: <FlaskConical className="h-8 w-8" />
    },
    'crushing': {
      title: 'Crushing',
      content: `Raw materials undergo mechanical crushing to achieve optimal powder consistency for processing. Our crushing facilities use industrial-grade equipment to ensure uniform particle size distribution.
      
      Following the crushing process, magnetic separation techniques are employed to refine the product and remove unwanted materials. This multi-stage approach ensures maximum purity and quality.`,
      icon: <Hammer className="h-8 w-8" />
    },
    'tagging': {
      title: 'Tagging',
      content: `Mandatory tagging of all materials entering our facility ensures complete traceability throughout the processing chain. Each batch receives unique identification tags that track the material from source to export.
      
      Our tagging system ensures compliance with international export standards and regulatory requirements. This comprehensive tracking system provides transparency and accountability in our operations.`,
      icon: <Tag className="h-8 w-8" />
    },
    'packing': {
      title: 'Packing',
      content: `Processed minerals are carefully packed into steel drums designed for international shipping. Each drum is sealed and labeled with corresponding tags that match our tracking system.
      
      Our packing procedures follow international standards for hazardous and non-hazardous materials. Quality control checks ensure proper sealing and labeling before drums proceed to the loading stage.`,
      icon: <Package className="h-8 w-8" />
    },
    'loading': {
      title: 'Loading',
      content: `Steel drums are systematically loaded into 40-foot shipping containers using specialized equipment. Our loading procedures ensure optimal weight distribution and secure positioning for international transport.
      
      Containers are prepared for transport to Dar es Salaam, Tanzania, our primary export hub. Each container is sealed and documented with complete manifests for customs clearance.`,
      icon: <Truck className="h-8 w-8" />
    },
    'shipping': {
      title: 'Shipping',
      content: `Containers are shipped by vessel from Dar es Salaam to final destinations worldwide. Our shipping network covers major international markets with reliable delivery schedules.
      
      Example shipping route: Kigali → Dar es Salaam → International export markets. We work with established shipping partners to ensure safe and timely delivery of all mineral products.`,
      icon: <Ship className="h-8 w-8" />
    }
  }

  // Combine static sections with dynamic content - show main services first, then subsections
  const allSections = [
    { id: 'services', title: 'Services' },
    ...serviceSections,
    ...servicesContent.filter(item => !serviceSections.some(s => s.title === item.title)).map(item => ({
      id: item.subsection || item.title.toLowerCase().replace(/\s+/g, '-'),
      title: item.title
    }))
  ]

  const getCurrentContent = (sectionId: string) => {
    // If main services section, return general services info
    if (sectionId === 'services') {
      return {
        title: 'Services',
        content: 'Our comprehensive mineral processing services cover the entire value chain from sourcing to shipping.',
        image_url: null,
        icon: <Cog className="h-8 w-8" />
      }
    }
    
    // First check if it's dynamic content
    const dynamicContent = servicesContent.find(item => 
      (item.subsection === sectionId) || 
      (item.title.toLowerCase().replace(/\s+/g, '-') === sectionId)
    )
    if (dynamicContent) return {
      title: dynamicContent.title,
      content: dynamicContent.content,
      image_url: dynamicContent.image_url,
      icon: <Cog className="h-8 w-8" />
    }
    
    // Otherwise use static content
    return staticContent[sectionId as ServiceSectionKey] || null
  }

  const currentContent = getCurrentContent(activeSection)
  
  // Get the appropriate image for current section/subsection
  const getCurrentImage = () => {
    console.log('ServicesSection getCurrentImage called with activeSection:', activeSection)
    console.log('servicesImages:', servicesImages)
    console.log('subsectionImages:', subsectionImages)
    
    // If main services section, use general services images (where subsection is null)
    if (activeSection === 'services') {
      const mainServicesImages = servicesImages.filter(img => img.subsection === null || img.subsection === '')
      console.log('mainServicesImages:', mainServicesImages)
      if (mainServicesImages && mainServicesImages.length > 0) {
        return mainServicesImages[0].file_path
      }
      // Fallback to static image for main services section
      return 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop'
    }
    
    // For subsections, try subsection-specific images first
    console.log('Looking for subsection images for:', activeSection)
    if (subsectionImages && subsectionImages.length > 0) {
      console.log('Found subsection images:', subsectionImages)
      return subsectionImages[0].file_path
    }
    
    // Then try content image_url from database content
    if ('image_url' in currentContent && currentContent?.image_url) {
      console.log('Using content image_url:', currentContent.image_url)
      return currentContent.image_url
    }
    
    // Static fallback images for each subsection
    const staticImages = {
      'sourcing': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'testing-analysis': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
      'crushing': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
      'tagging': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
      'packing': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      'loading': 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=800&h=600&fit=crop',
      'shipping': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=600&fit=crop'
    }
    
    if (staticImages[activeSection as keyof typeof staticImages]) {
      console.log('Using static fallback image for:', activeSection)
      return staticImages[activeSection as keyof typeof staticImages]
    }
    
    // Finally try general services section images as fallback
    const mainServicesImages = servicesImages.filter(img => img.subsection === null || img.subsection === '')
    if (mainServicesImages && mainServicesImages.length > 0) {
      console.log('Using fallback main services image:', mainServicesImages[0].file_path)
      return mainServicesImages[0].file_path
    }
    
    // Final fallback to static services image
    console.log('Using final static fallback')
    return 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop'
  }

  // Listen for subsection change events from navbar
  useEffect(() => {
    const handleSubsectionChange = (event: CustomEvent) => {
      if (event.detail.section === 'services') {
        setActiveSection(event.detail.subsection)
      }
    }
    
    window.addEventListener('changeSubsection', handleSubsectionChange as EventListener)
    return () => window.removeEventListener('changeSubsection', handleSubsectionChange as EventListener)
  }, [])

  // Refresh images when activeSection changes
  useEffect(() => {
    if (activeSection === 'services') {
      refreshServicesImages()
    } else {
      refreshSubsectionImages()
    }
  }, [activeSection])

  // Listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = () => {
      if (activeSection === 'services') {
        refreshServicesImages()
      } else {
        refreshSubsectionImages()
      }
    }
    
    window.addEventListener('contentUpdated', handleContentUpdate)
    return () => window.removeEventListener('contentUpdated', handleContentUpdate)
  }, [activeSection])

  const currentImage = getCurrentImage()

  return (
    <section id="services" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-[85vh] bg-gray-100 relative flex items-center justify-center" style={{
        backgroundImage: currentImage ? `url("${currentImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!currentImage && <Cog className="h-24 w-24 text-gray-400" />}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full h-full bg-black/30 flex items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold text-white">{currentContent?.title || 'Services'}</h2>
        </div>
      </div>
      
      <div className={themeClasses.spacing}>
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h3 className="font-bold text-gray-900 mb-4">Service Workflow</h3>
                <ul className="space-y-2">
                  {(showAllSections ? allSections : allSections.slice(0, 4)).map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors border-b-2 ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-900 font-medium border-blue-500'
                            : 'text-gray-600 hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                  {allSections.length > 4 && (
                    <li>
                      <button
                        onClick={() => setShowAllSections(!showAllSections)}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm rounded transition-colors hover:bg-gray-100 text-blue-600"
                      >
                        {showAllSections ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show More ({allSections.length - 4})
                          </>
                        )}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                <div className="flex items-center mb-6">
                  <div className="mr-4 text-blue-600">
                    {currentContent?.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentContent?.title}
                  </h3>
                </div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {currentContent?.content}
                </div>
                {/* Show additional subsection image if different from hero */}
                {'image_url' in currentContent && currentContent?.image_url && currentContent.image_url !== currentImage && (
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

export default ServicesSection