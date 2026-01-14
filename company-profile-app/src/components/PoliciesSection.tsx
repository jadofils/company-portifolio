'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Shield } from 'lucide-react'
import { useImages } from '@/hooks/useImages'

type PolicySectionKey =
  | 'environmental-policy'
  | 'safety-standards'
  | 'quality-assurance'
  | 'compliance'

const PoliciesSection = () => {
  const [activeSection, setActiveSection] = useState<PolicySectionKey>('environmental-policy')
  const { imageUrls } = useImages('policies')

  const policySections: { id: PolicySectionKey; title: string }[] = [
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

  // Listen for subsection change events from navbar
  useEffect(() => {
    const handleSubsectionChange = (event: CustomEvent) => {
      if (event.detail.section === 'policies') {
        const subsectionKey = event.detail.subsection as PolicySectionKey
        if (Object.keys(sectionContent).includes(subsectionKey)) {
          setActiveSection(subsectionKey)
        }
      }
    }
    
    window.addEventListener('changeSubsection', handleSubsectionChange as EventListener)
    return () => window.removeEventListener('changeSubsection', handleSubsectionChange as EventListener)
  }, [])

  return (
    <section id="policies" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-[85vh] bg-gray-100 relative flex items-center justify-center" style={{
        backgroundImage: imageUrls[0] ? `url("${imageUrls[0]}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!imageUrls[0] && <Shield className="h-24 w-24 text-gray-400" />}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full h-full bg-black/30 flex items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold text-white">Policies</h2>
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
                  {policySections.map((section) => (
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
                  {sectionContent[activeSection].title}
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                  {sectionContent[activeSection].content}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <h4 className="font-bold text-gray-900 mb-3">Key Points:</h4>
                  <ul className="space-y-2">
                    {sectionContent[activeSection].keyPoints.map((point, index) => (
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