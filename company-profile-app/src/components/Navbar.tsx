'use client'

import { useState } from 'react'
import { Menu, X, ChevronDown, Building2, Users, History, Target, Leaf, Search, FlaskConical, Hammer, Tag, Package, Truck, Ship, Gem, Shield, FileText, Scale, Award } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useSettings } from '@/hooks/useSettings'
import { useContent } from '@/hooks/useContent'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { settings } = useSettings()
  const { getContentBySection } = useContent()

  // Get dynamic subsections from database
  const aboutContent = getContentBySection('about')
  const servicesContent = getContentBySection('services')
  const productsContent = getContentBySection('products')
  const policiesContent = getContentBySection('policies')

  // Static fallback data with icons
  const staticAbout = [
    { title: 'Corporate Governance', icon: Scale },
    { title: 'Our History', icon: History },
    { title: 'Leadership Team', icon: Users },
    { title: 'Mission & Vision', icon: Target },
    { title: 'Sustainability', icon: Leaf }
  ]
  const staticServices = [
    { title: 'Sourcing', icon: Search },
    { title: 'Testing & Analysis', icon: FlaskConical },
    { title: 'Crushing', icon: Hammer },
    { title: 'Tagging', icon: Tag },
    { title: 'Packing', icon: Package },
    { title: 'Loading', icon: Truck },
    { title: 'Shipping', icon: Ship }
  ]
  const staticProducts = [
    { title: 'Coltan', icon: Gem },
    { title: 'Cassiterite', icon: Gem },
    { title: 'Tungsten', icon: Gem }
  ]
  const staticPolicies = [
    { title: 'Environmental Policy', icon: Leaf },
    { title: 'Safety Standards', icon: Shield },
    { title: 'Quality Assurance', icon: Award },
    { title: 'Compliance', icon: FileText }
  ]

  // Combine static and dynamic content - show all static items plus any new dynamic ones
  const aboutItems = [
    ...staticAbout.map((item, index) => {
      const subsectionKey = item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
      return {
        ...item,
        image_url: aboutContent.find(c => c.title === item.title)?.image_url || null
      }
    }),
    ...aboutContent.filter(item => !staticAbout.some(s => s.title === item.title)).map(item => ({
      title: item.title,
      icon: Building2,
      image_url: item.image_url
    }))
  ]
  const services = [
    ...staticServices.map((item, index) => {
      const subsectionKey = item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
      return {
        ...item,
        image_url: servicesContent.find(c => c.title === item.title)?.image_url || null
      }
    }),
    ...servicesContent.filter(item => !staticServices.some(s => s.title === item.title)).map(item => ({
      title: item.title,
      icon: Building2,
      image_url: item.image_url
    }))
  ]
  const products = [
    ...staticProducts.map((item, index) => {
      const subsectionKey = item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
      return {
        ...item,
        image_url: productsContent.find(c => c.title === item.title)?.image_url || null
      }
    }),
    ...productsContent.filter(item => !staticProducts.some(s => s.title === item.title)).map(item => ({
      title: item.title,
      icon: Gem,
      image_url: item.image_url
    }))
  ]
  const policies = [
    ...staticPolicies.map((item, index) => {
      const subsectionKey = item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
      return {
        ...item,
        image_url: policiesContent.find(c => c.title === item.title)?.image_url || null
      }
    }),
    ...policiesContent.filter(item => !staticPolicies.some(s => s.title === item.title)).map(item => ({
      title: item.title,
      icon: Shield,
      image_url: item.image_url
    }))
  ]

  const scrollToSection = (sectionId: string, subsection?: string) => {
    // If not on home page, navigate to home first
    if (pathname !== '/') {
      const hash = subsection ? `${sectionId}-${subsection}` : sectionId
      router.push(`/#${hash}`)
      return
    }
    
    // If on home page, scroll to section
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      
      // If subsection specified, trigger subsection change after scroll
      if (subsection) {
        setTimeout(() => {
          const event = new CustomEvent('changeSubsection', { 
            detail: { section: sectionId, subsection } 
          })
          window.dispatchEvent(event)
        }, 500)
      }
    }
    setIsOpen(false)
  }

  console.log('About items:', aboutItems)
  console.log('Services:', services)
  console.log('Products:', products)
  console.log('Policies:', policies)

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
      <div className="container-max section-padding">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            {settings.company_logo ? (
              <img 
                src={settings.company_logo} 
                alt={`${settings.company_name} Logo`}
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <Building2 className={`h-16 w-16 text-blue-600 ${settings.company_logo ? 'hidden' : ''}`} />
            <h1 className="text-xl font-bold text-gray-900">{settings.company_name}</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
              >
                Home
              </button>
              {/* About Dropdown */}
              <div className="relative group">
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium flex items-center transition-colors duration-200"
                >
                  About Us <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {aboutItems.map((item) => (
                      <button
                        key={item.title}
                        onClick={() => {
                          const subsection = item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
                          scrollToSection('about', subsection)
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <div className="w-12 h-8 mr-3 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <item.icon className={`h-4 w-4 text-gray-500 ${item.image_url ? 'hidden' : ''}`} />
                        </div>
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Services Dropdown */}
              <div className="relative group">
                <button 
                  onClick={() => scrollToSection('services')}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium flex items-center transition-colors duration-200"
                >
                  Services <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {services.map((service) => (
                      <button
                        key={service.title}
                        onClick={() => {
                          const subsection = service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
                          scrollToSection('services', subsection)
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <div className="w-12 h-8 mr-3 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                          {service.image_url ? (
                            <img 
                              src={service.image_url} 
                              alt={service.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <service.icon className={`h-4 w-4 text-gray-500 ${service.image_url ? 'hidden' : ''}`} />
                        </div>
                        <span>{service.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Products Dropdown */}
              <div className="relative group">
                <button 
                  onClick={() => scrollToSection('products')}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium flex items-center transition-colors duration-200"
                >
                  Products <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {products.map((product) => (
                      <button
                        key={product.title}
                        onClick={() => {
                          const subsection = product.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
                          scrollToSection('products', subsection)
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <div className="w-12 h-8 mr-3 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <product.icon className={`h-4 w-4 text-gray-500 ${product.image_url ? 'hidden' : ''}`} />
                        </div>
                        <span>{product.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Policies Dropdown */}
              <div className="relative group">
                <button 
                  onClick={() => scrollToSection('policies')}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium flex items-center transition-colors duration-200"
                >
                  Policies <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {policies.map((policy) => (
                      <button
                        key={policy.title}
                        onClick={() => {
                          const subsection = policy.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
                          scrollToSection('policies', subsection)
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <div className="w-12 h-8 mr-3 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                          {policy.image_url ? (
                            <img 
                              src={policy.image_url} 
                              alt={policy.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <policy.icon className={`h-4 w-4 text-gray-500 ${policy.image_url ? 'hidden' : ''}`} />
                        </div>
                        <span>{policy.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
              >
                Contact Us
              </button>
              <a
                href="/publications"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
              >
                Publications
              </a>
              {pathname !== '/login' && pathname !== '/forgot-password' && (
                <a
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
                >
                  Login
                </a>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2 space-y-1">
              <button
                onClick={() => scrollToSection('home')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                About Us
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('products')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Contact Us
              </button>
              <a
                href="/publications"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Publications
              </a>
              {pathname !== '/login' && pathname !== '/forgot-password' && (
                <a
                  href="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar