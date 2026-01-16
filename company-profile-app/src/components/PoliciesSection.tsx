'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Shield } from 'lucide-react'
import { useImages } from '@/hooks/useImages'
import { useContent } from '@/hooks/useContent'

type PolicySectionKey =
  | 'environmental-policy'
  | 'safety-standards'
  | 'quality-assurance'
  | 'compliance'

const PoliciesSection = () => {
  const [activeSection, setActiveSection] = useState('policies')
  const { images: policiesImages, refreshImages: refreshPoliciesImages } = useImages('policies')
  const { images: subsectionImages, refreshImages: refreshSubsectionImages } = useImages('policies', activeSection === 'policies' ? undefined : activeSection)
  const { getContentBySection } = useContent()
  const policiesContent = getContentBySection('policies')

  const staticSections = [
    { id: 'environmental-policy', title: 'Environmental Policy' },
    { id: 'safety-standards', title: 'Safety Standards' },
    { id: 'quality-assurance', title: 'Quality Assurance' },
    { id: 'compliance', title: 'Compliance' }
  ]

  const sectionContent: Record<PolicySectionKey, { title: string; content: string; keyPoints: string[] }> = {
    'environmental-policy': {
      title: 'Environmental Policy',
      content: `We are committed to sustainable mining practices and environmental protection throughout our operations. Our comprehensive environmental policy ensures minimal ecological impact while maintaining operational efficiency.
      
      Our environmental management system includes zero waste to landfill initiatives, water recycling systems, and habitat restoration programs. We continuously monitor our environmental impact and implement improvement measures.`,
      keyPoints: [
        'Zero waste to landfill policy',
        'Water recycling and conservation',
        'Habitat restoration programs',
        'Carbon footprint reduction',
        'Environmental impact monitoring'
      ]
    },
    'safety-standards': {
      title: 'Safety Standards',
      content: `Safety is our top priority in all mining and processing operations. We maintain uncompromising commitment to workplace safety and health with comprehensive safety protocols and regular training programs.
      
      Our safety management system complies with OSHA standards and international best practices. We conduct regular safety audits, provide ongoing training, and maintain emergency response procedures.`,
      keyPoints: [
        'OSHA compliance and certification',
        'Regular safety training programs',
        'Emergency response procedures',
        'Personal protective equipment',
        'Incident reporting and analysis'
      ]
    },
    'quality-assurance': {
      title: 'Quality Assurance',
      content: `We maintain the highest standards in mineral processing through our comprehensive quality assurance program. Our ISO 9001 certification demonstrates our commitment to consistent quality and continuous improvement.
      
      Our quality control processes include rigorous testing at every stage of production, from raw material assessment to final product certification. We use advanced analytical equipment and maintain detailed quality records.`,
      keyPoints: [
        'ISO 9001 certification',
        'Continuous quality monitoring',
        'Advanced analytical testing',
        'Product certification processes',
        'Customer satisfaction tracking'
      ]
    },
    'compliance': {
      title: 'Compliance',
      content: `We adhere to all regulatory requirements and international standards across our operations. Our compliance program ensures full adherence to mining regulations, environmental laws, and export requirements.
      
      Regular audits and assessments verify our compliance with local and international regulations. We maintain all necessary permits and certifications while staying current with evolving regulatory requirements.`,
      keyPoints: [
        'Regulatory compliance monitoring',
        'International standards adherence',
        'Regular compliance audits',
        'Environmental permits maintenance',
        'Export certification processes'
      ]
    }
  }

  // Combine static sections with dynamic content - show main policies first, then subsections
  const allSections = [
    { id: 'policies', title: 'Policies' },
    ...staticSections,
    ...policiesContent.filter(item => !staticSections.some(s => s.title === item.title)).map(item => {
      console.log('Dynamic policy item:', item)
      return {
        id: item.subsection || item.title.toLowerCase().replace(/\s+/g, '-'),
        title: item.title
      }
    })
  ]
  
  console.log('PoliciesSection allSections:', allSections)
  console.log('PoliciesSection policiesContent:', policiesContent)

  const getCurrentContent = (sectionId: string) => {
    // If main policies section, return general policies info
    if (sectionId === 'policies') {
      return {
        title: 'Policies',
        content: 'Our comprehensive policies ensure responsible mining practices, environmental protection, and regulatory compliance.',
        keyPoints: [
          'Environmental sustainability',
          'Safety and health standards',
          'Quality assurance processes',
          'Regulatory compliance',
          'Ethical business practices'
        ]
      }
    }
    
    // First check if it's dynamic content
    const dynamicContent = policiesContent.find(item => 
      (item.subsection === sectionId) || 
      (item.title.toLowerCase().replace(/\s+/g, '-') === sectionId)
    )
    if (dynamicContent) return {
      title: dynamicContent.title,
      content: dynamicContent.content,
      keyPoints: ['Database content', 'Custom policy information']
    }
    
    // Otherwise use static content
    return sectionContent[sectionId as PolicySectionKey] || null
  }

  const currentContent = getCurrentContent(activeSection)
  
  // Get the appropriate image for current section/subsection
  const getCurrentImage = () => {
    console.log('=== PoliciesSection getCurrentImage Debug ===')
    console.log('activeSection:', activeSection)
    console.log('policiesImages (all):', policiesImages)
    console.log('subsectionImages (filtered):', subsectionImages)
    
    // Debug: Show what we're looking for
    console.log('Looking for images with:')
    console.log('- section: policies')
    console.log('- subsection:', activeSection)
    
    // If main policies section, use general policies images (where subsection is null)
    if (activeSection === 'policies') {
      const mainPoliciesImages = policiesImages.filter(img => img.subsection === null || img.subsection === '')
      console.log('mainPoliciesImages filtered:', mainPoliciesImages)
      if (mainPoliciesImages && mainPoliciesImages.length > 0) {
        console.log('Using main policies image:', mainPoliciesImages[0].file_path)
        return mainPoliciesImages[0].file_path
      }
      console.log('Using static fallback for main policies')
      return 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop'
    }
    
    // For subsections, try subsection-specific images first
    console.log('Looking for subsection images for:', activeSection)
    console.log('subsectionImages available:', subsectionImages)
    if (subsectionImages && subsectionImages.length > 0) {
      console.log('Found subsection images, using:', subsectionImages[0].file_path)
      return subsectionImages[0].file_path
    }
    
    // Debug: Check all possible matches in policiesImages
    console.log('Checking all policiesImages for matches:')
    policiesImages.forEach((img, index) => {
      console.log(`Image ${index}:`, {
        id: img.id,
        subsection: img.subsection,
        title: img.title,
        file_path: img.file_path,
        matches_activeSection: img.subsection === activeSection
      })
    })
    
    // Try to find any policies images that match the current subsection
    // Check both exact match and normalized versions
    const normalizedActiveSection = activeSection.replace(/\s+/g, '-').toLowerCase()
    const matchingPoliciesImages = policiesImages.filter(img => 
      img.subsection === activeSection || 
      img.subsection === normalizedActiveSection ||
      (img.subsection && img.subsection.replace(/\s+/g, '-').toLowerCase() === normalizedActiveSection)
    )
    console.log('matchingPoliciesImages for', activeSection, '(normalized:', normalizedActiveSection, '):', matchingPoliciesImages)
    if (matchingPoliciesImages && matchingPoliciesImages.length > 0) {
      console.log('Using matching policies image:', matchingPoliciesImages[0].file_path)
      return matchingPoliciesImages[0].file_path
    }
    
    // Static fallback images for each subsection
    const staticImages = {
      'environmental-policy': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'safety-standards': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
      'quality-assurance': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
      'compliance': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop'
    }
    
    if (staticImages[activeSection as keyof typeof staticImages]) {
      console.log('Using static fallback image for:', activeSection)
      return staticImages[activeSection as keyof typeof staticImages]
    }
    
    // Finally try general policies section images as fallback
    const mainPoliciesImages = policiesImages.filter(img => img.subsection === null || img.subsection === '')
    if (mainPoliciesImages && mainPoliciesImages.length > 0) {
      console.log('Using fallback main policies image:', mainPoliciesImages[0].file_path)
      return mainPoliciesImages[0].file_path
    }
    
    // Final fallback to static policies image
    console.log('Using final static fallback')
    return 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop'
  }

  // Listen for subsection change events from navbar
  useEffect(() => {
    const handleSubsectionChange = (event: CustomEvent) => {
      console.log('PoliciesSection received changeSubsection event:', event.detail)
      if (event.detail.section === 'policies') {
        console.log('Setting activeSection to:', event.detail.subsection)
        setActiveSection(event.detail.subsection)
      }
    }
    
    window.addEventListener('changeSubsection', handleSubsectionChange as EventListener)
    return () => window.removeEventListener('changeSubsection', handleSubsectionChange as EventListener)
  }, [])

  // Refresh images when activeSection changes
  useEffect(() => {
    console.log('PoliciesSection: activeSection changed to:', activeSection)
    // Don't refresh if we're still on the same section
    if (activeSection === 'policies') {
      refreshPoliciesImages()
    } else {
      // Only refresh if we actually have a different subsection
      refreshSubsectionImages()
    }
  }, [activeSection]) // Remove the function dependencies to prevent infinite loop

  // Listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = () => {
      if (activeSection === 'policies') {
        refreshPoliciesImages()
      } else {
        refreshSubsectionImages()
      }
    }
    
    window.addEventListener('contentUpdated', handleContentUpdate)
    return () => window.removeEventListener('contentUpdated', handleContentUpdate)
  }, [activeSection])

  const currentImage = getCurrentImage()

  return (
    <section id="policies" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-[85vh] bg-gray-100 relative flex items-center justify-center" style={{
        backgroundImage: currentImage ? `url("${currentImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!currentImage && <Shield className="h-24 w-24 text-gray-400" />}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full h-full bg-black/30 flex items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold text-white">{currentContent?.title || 'Policies'}</h2>
        </div>
      </div>
      
      <div className="py-20">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h3 className="font-bold text-gray-900 mb-4">Policy Areas</h3>
                <ul className="space-y-2">
                  {allSections.map((section) => (
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
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentContent?.title}
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                  {currentContent?.content}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <h4 className="font-bold text-gray-900 mb-3">Key Points:</h4>
                  <ul className="space-y-2">
                    {currentContent?.keyPoints?.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PoliciesSection