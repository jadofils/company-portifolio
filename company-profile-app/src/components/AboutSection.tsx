'use client'

import { useState } from 'react'

type AboutSectionKey =
  | 'corporate-governance'
  | 'our-history'
  | 'leadership-team'
  | 'mission-vision'
  | 'sustainability'

const AboutSection = () => {
  const [activeSection, setActiveSection] = useState<AboutSectionKey>('corporate-governance')

  const images = [
    "https://th.bing.com/th/id/OIP.LiODO2lw3Zcv843Pi0vvJAHaEK?w=369&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Mining operation
    "https://th.bing.com/th/id/OIP.9i_fNXTfm3RWJW6W9cd9mAHaE8?w=331&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Mining equipment
    "https://th.bing.com/th/id/OIP.p6FM3vNeT9ts6h5j8fLUUQHaEJ?w=324&h=182&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Gold minerals
    "https://th.bing.com/th/id/OIP.dl7epDFleTqukHg0gdzumwHaE5?w=274&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3", // Industrial mining
    "https://th.bing.com/th/id/OIP.LiODO2lw3Zcv843Pi0vvJAHaEK?w=369&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"  // Corporate
  ]

  const aboutSections: { id: AboutSectionKey; title: string; imageIndex: number }[] = [
    { id: 'corporate-governance', title: 'Corporate Governance', imageIndex: 4 },
    { id: 'our-history', title: 'Our History', imageIndex: 0 },
    { id: 'leadership-team', title: 'Leadership Team', imageIndex: 1 },
    { id: 'mission-vision', title: 'Mission & Vision', imageIndex: 2 },
    { id: 'sustainability', title: 'Sustainability', imageIndex: 3 }
  ]

  const sectionContent: Record<AboutSectionKey, { title: string; content: string }> = {
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

  return (
    <section id="about" className="bg-white">
      {/* Hero Image */}
      <div className="w-full h-80 bg-cover bg-center" style={{
        backgroundImage: `url("${images[aboutSections.find(s => s.id === activeSection)?.imageIndex || 0]}")`
      }}>
        <div className="w-full h-full bg-black/50 flex items-center justify-center">
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
                  {aboutSections.map((section) => (
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

export default AboutSection