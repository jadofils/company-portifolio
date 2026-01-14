'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Gem } from 'lucide-react'
import { useImages } from '@/hooks/useImages'

type ProductSectionKey =
  | 'coltan'
  | 'cassiterite'
  | 'tungsten'

const ProductsSection = () => {
  const [activeSection, setActiveSection] = useState<ProductSectionKey>('coltan')
  const { imageUrls } = useImages('products')

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

  // Listen for subsection change events from navbar
  useEffect(() => {
    const handleSubsectionChange = (event: CustomEvent) => {
      if (event.detail.section === 'products') {
        const subsectionKey = event.detail.subsection as ProductSectionKey
        if (Object.keys(sectionContent).includes(subsectionKey)) {
          setActiveSection(subsectionKey)
        }
      }
    }
    
    window.addEventListener('changeSubsection', handleSubsectionChange as EventListener)
    return () => window.removeEventListener('changeSubsection', handleSubsectionChange as EventListener)
  }, [])

  return (
    <section id="products" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-[85vh] bg-gray-100 relative flex items-center justify-center" style={{
        backgroundImage: imageUrls[0] ? `url("${imageUrls[0]}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!imageUrls[0] && <Gem className="h-24 w-24 text-gray-400" />}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full h-full bg-black/30 flex items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold text-white">Products</h2>
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
                  {productSections.map((section) => (
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
                  {sectionContent[activeSection].title}
                </h3>
                <p className="text-lg text-gray-500 mb-6">
                  {sectionContent[activeSection].fullName}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                  <p className="text-sm font-medium text-blue-900">
                    {sectionContent[activeSection].chemicalInfo}
                  </p>
                </div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                  {sectionContent[activeSection].content}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Applications:</h4>
                  <p className="text-gray-600">{sectionContent[activeSection].applications}</p>
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