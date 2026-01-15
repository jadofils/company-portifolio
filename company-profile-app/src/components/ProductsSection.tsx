'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Gem } from 'lucide-react'
import { useImages } from '@/hooks/useImages'
import { useContent } from '@/hooks/useContent'

type ProductSectionKey =
  | 'coltan'
  | 'cassiterite'
  | 'tungsten'

const ProductsSection = () => {
  // Fixed duplicate sectionContent issue
  const [activeSection, setActiveSection] = useState('products')
  const { images: productsImages, refreshImages: refreshProductsImages } = useImages('products')
  const { images: subsectionImages, refreshImages: refreshSubsectionImages } = useImages('products', activeSection === 'products' ? undefined : activeSection)
  const { getContentBySection } = useContent()
  const productsContent = getContentBySection('products')

  const productSections: { id: ProductSectionKey; title: string }[] = [
    { id: 'coltan', title: 'Coltan' },
    { id: 'cassiterite', title: 'Cassiterite' },
    { id: 'tungsten', title: 'Tungsten' }
  ]

  const sectionContent: Record<ProductSectionKey, { title: string; fullName: string; content: string; chemicalInfo: string; applications: string }> = {
    'coltan': {
      title: 'Coltan',
      fullName: 'Columbite–tantalite (industrial name: tantalite)',
      content: `Coltan is a dull black metallic ore that has become increasingly valuable in the electronics industry. It is the primary source of tantalum, a rare metal essential for manufacturing capacitors used in electronic devices.
      
      Our coltan processing ensures high purity levels suitable for industrial applications. The mineral undergoes rigorous testing and refinement to meet international quality standards for electronics manufacturing.`,
      chemicalInfo: 'Industrial name: tantalite',
      applications: 'Electronics capacitors, mobile phones, computers, automotive electronics'
    },
    'cassiterite': {
      title: 'Cassiterite',
      fullName: 'Tin Oxide (SnO₂)',
      content: `Cassiterite is the primary ore of tin and appears generally opaque, but can be translucent in thin crystals. It is one of the most important tin-bearing minerals in commercial mining operations.
      
      Our cassiterite processing focuses on achieving optimal tin content through advanced separation techniques. The refined product meets international standards for tin production and industrial applications.`,
      chemicalInfo: 'Chemical formula: SnO₂',
      applications: 'Tin production, soldering materials, bronze alloys, food packaging'
    },
    'tungsten': {
      title: 'Tungsten',
      fullName: 'Wolfram (W)',
      content: `Tungsten, also known as wolfram, is a rare metal with the highest melting point of all elements. It is essential for various industrial applications due to its exceptional hardness and heat resistance properties.
      
      Our tungsten processing delivers high-grade concentrates suitable for steel alloys, cutting tools, and specialized industrial applications. The mineral undergoes careful extraction and purification processes.`,
      chemicalInfo: 'Symbol: W, Atomic number: 74',
      applications: 'Steel alloys, cutting tools, electronics, aerospace components'
    }
  }

  // Combine static sections with dynamic content - show main products first, then subsections
  const allSections = [
    { id: 'products', title: 'Products' },
    ...productSections,
    ...productsContent.filter(item => !productSections.some(s => s.title === item.title)).map(item => ({
      id: item.subsection || item.title.toLowerCase().replace(/\s+/g, '-'),
      title: item.title
    }))
  ]

  const getCurrentContent = (sectionId: string) => {
    // If main products section, return general products info
    if (sectionId === 'products') {
      return {
        title: 'Products',
        fullName: 'Our Mineral Products',
        content: 'We specialize in processing and exporting high-quality minerals including coltan, cassiterite, and tungsten.',
        chemicalInfo: 'Premium grade minerals',
        applications: 'Electronics, industrial applications, manufacturing'
      }
    }
    
    // First check if it's dynamic content
    const dynamicContent = productsContent.find(item => 
      (item.subsection === sectionId) || 
      (item.title.toLowerCase().replace(/\s+/g, '-') === sectionId)
    )
    if (dynamicContent) return {
      title: dynamicContent.title,
      fullName: dynamicContent.title,
      content: dynamicContent.content,
      chemicalInfo: 'Database content',
      applications: 'Various industrial applications'
    }
    
    // Otherwise use static content
    return sectionContent[sectionId as ProductSectionKey] || null
  }

  const currentContent = getCurrentContent(activeSection)
  
  // Get the appropriate image for current section/subsection
  const getCurrentImage = () => {
    console.log('ProductsSection getCurrentImage called with activeSection:', activeSection)
    console.log('productsImages:', productsImages)
    console.log('subsectionImages:', subsectionImages)
    
    // If main products section, use general products images (where subsection is null)
    if (activeSection === 'products') {
      const mainProductsImages = productsImages.filter(img => img.subsection === null || img.subsection === '')
      console.log('mainProductsImages:', mainProductsImages)
      if (mainProductsImages && mainProductsImages.length > 0) {
        return mainProductsImages[0].file_path
      }
      // Fallback to static image for main products section
      return 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=800&h=600&fit=crop'
    }
    
    // For subsections, try subsection-specific images first
    console.log('Looking for subsection images for:', activeSection)
    if (subsectionImages && subsectionImages.length > 0) {
      console.log('Found subsection images:', subsectionImages)
      return subsectionImages[0].file_path
    }
    
    // Static fallback images for each subsection
    const staticImages = {
      'coltan': 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop',
      'cassiterite': 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=800&h=600&fit=crop',
      'tungsten': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    }
    
    if (staticImages[activeSection as keyof typeof staticImages]) {
      console.log('Using static fallback image for:', activeSection)
      return staticImages[activeSection as keyof typeof staticImages]
    }
    
    // Finally try general products section images as fallback
    const mainProductsImages = productsImages.filter(img => img.subsection === null || img.subsection === '')
    if (mainProductsImages && mainProductsImages.length > 0) {
      console.log('Using fallback main products image:', mainProductsImages[0].file_path)
      return mainProductsImages[0].file_path
    }
    
    // Final fallback to static products image
    console.log('Using final static fallback')
    return 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=800&h=600&fit=crop'
  }

  // Listen for subsection change events from navbar
  useEffect(() => {
    const handleSubsectionChange = (event: CustomEvent) => {
      if (event.detail.section === 'products') {
        setActiveSection(event.detail.subsection)
      }
    }
    
    window.addEventListener('changeSubsection', handleSubsectionChange as EventListener)
    return () => window.removeEventListener('changeSubsection', handleSubsectionChange as EventListener)
  }, [])

  // Refresh images when activeSection changes
  useEffect(() => {
    if (activeSection === 'products') {
      refreshProductsImages()
    } else {
      refreshSubsectionImages()
    }
  }, [activeSection])

  const currentImage = getCurrentImage()

  return (
    <section id="products" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-[85vh] bg-gray-100 relative flex items-center justify-center" style={{
        backgroundImage: currentImage ? `url("${currentImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!currentImage && <Gem className="h-24 w-24 text-gray-400" />}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full h-full bg-black/30 flex items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold text-white">{currentContent?.title || 'Products'}</h2>
        </div>
      </div>
      
      <div className="py-20">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h3 className="font-bold text-gray-900 mb-4">Our Minerals</h3>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentContent?.title}
                </h3>
                <p className="text-lg text-gray-500 mb-6">
                  {currentContent?.fullName}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                  <p className="text-sm font-medium text-blue-900">
                    {currentContent?.chemicalInfo}
                  </p>
                </div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                  {currentContent?.content}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Applications:</h4>
                  <p className="text-gray-600">{currentContent?.applications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductsSection