'use client'

import { useState } from 'react'
import { Search, FlaskConical, Hammer, Tag, Package, Truck, Ship, ArrowRight } from 'lucide-react'

type ServiceSectionKey =
  | 'sourcing'
  | 'testing-analysis'
  | 'crushing'
  | 'tagging'
  | 'packing'
  | 'loading'
  | 'shipping'

const ServicesSection = () => {
  const [activeSection, setActiveSection] = useState<ServiceSectionKey>('sourcing')

  const images = [
    "https://th.bing.com/th/id/OIP.LiODO2lw3Zcv843Pi0vvJAHaEK?w=369&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Mining operation
    "https://th.bing.com/th/id/OIP.9i_fNXTfm3RWJW6W9cd9mAHaE8?w=331&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Mining equipment
    "https://th.bing.com/th/id/OIP.p6FM3vNeT9ts6h5j8fLUUQHaEJ?w=324&h=182&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Gold minerals
    "https://th.bing.com/th/id/OIP.dl7epDFleTqukHg0gdzumwHaE5?w=274&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"  // Industrial mining
  ]

  const serviceSections: { id: ServiceSectionKey; title: string; imageIndex: number }[] = [
    { id: 'sourcing', title: 'Sourcing', imageIndex: 0 },
    { id: 'testing-analysis', title: 'Testing & Analysis', imageIndex: 1 },
    { id: 'crushing', title: 'Crushing', imageIndex: 2 },
    { id: 'tagging', title: 'Tagging', imageIndex: 3 },
    { id: 'packing', title: 'Packing', imageIndex: 0 },
    { id: 'loading', title: 'Loading', imageIndex: 1 },
    { id: 'shipping', title: 'Shipping', imageIndex: 2 }
  ]

  const sectionContent: Record<ServiceSectionKey, { title: string; content: string; icon: JSX.Element }> = {
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

  return (
    <section id="services" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-80 bg-cover bg-center" style={{
        backgroundImage: `url("${images[serviceSections.find(s => s.id === activeSection)?.imageIndex || 0]}")`
      }}>
        <div className="w-full h-full bg-black/50 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-white">Services</h2>
        </div>
      </div>
      
      <div className="py-20">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h3 className="font-bold text-gray-900 mb-4">Service Workflow</h3>
                <ul className="space-y-2">
                  {serviceSections.map((section) => (
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
                <div className="flex items-center mb-6">
                  <div className="mr-4 text-blue-600">
                    {sectionContent[activeSection].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {sectionContent[activeSection].title}
                  </h3>
                </div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {sectionContent[activeSection].content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection