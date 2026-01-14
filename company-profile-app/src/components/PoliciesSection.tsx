'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

type PolicySectionKey =
  | 'environmental-policy'
  | 'safety-standards'
  | 'quality-assurance'
  | 'compliance'

const PoliciesSection = () => {
  const [activeSection, setActiveSection] = useState<PolicySectionKey>('environmental-policy')

  const images = [
    "https://th.bing.com/th/id/OIP.LiODO2lw3Zcv843Pi0vvJAHaEK?w=369&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Mining operation
    "https://th.bing.com/th/id/OIP.9i_fNXTfm3RWJW6W9cd9mAHaE8?w=331&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Mining equipment
    "https://th.bing.com/th/id/OIP.p6FM3vNeT9ts6h5j8fLUUQHaEJ?w=324&h=182&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Gold minerals
    "https://th.bing.com/th/id/OIP.dl7epDFleTqukHg0gdzumwHaE5?w=274&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"  // Industrial mining
  ]

  const policySections: { id: PolicySectionKey; title: string; imageIndex: number }[] = [
    { id: 'environmental-policy', title: 'Environmental Policy', imageIndex: 0 },
    { id: 'safety-standards', title: 'Safety Standards', imageIndex: 1 },
    { id: 'quality-assurance', title: 'Quality Assurance', imageIndex: 2 },
    { id: 'compliance', title: 'Compliance', imageIndex: 3 }
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

  return (
    <section id="policies" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-80 bg-cover bg-center" style={{
        backgroundImage: `url("${images[policySections.find(s => s.id === activeSection)?.imageIndex || 0]}")`
      }}>
        <div className="w-full h-full bg-black/50 flex items-center justify-center">
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