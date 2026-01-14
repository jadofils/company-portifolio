'use client'

import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const scrollToSection = (sectionId: string) => {
    // If not on home page, navigate to home first
    if (pathname !== '/') {
      router.push(`/#${sectionId}`)
      return
    }
    
    // If on home page, scroll to section
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const services = [
    'Sourcing', 'Testing & Analysis', 'Crushing', 'Tagging', 'Packing', 'Loading', 'Shipping'
  ]

  const products = [
    'Coltan', 'Cassiterite', 'Tungsten'
  ]

  const policies = [
    'Environmental Policy', 'Safety Standards', 'Quality Assurance', 'Compliance'
  ]

  const aboutItems = [
    'Corporate Governance', 'Our History', 'Leadership Team', 'Mission & Vision', 'Sustainability'
  ]

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
      <div className="container-max section-padding">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">MineralsCorp</h1>
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
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {aboutItems.map((item) => (
                      <button
                        key={item}
                        onClick={() => scrollToSection('about')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        {item}
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
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {services.map((service) => (
                      <button
                        key={service}
                        onClick={() => scrollToSection('services')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        {service}
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
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {products.map((product) => (
                      <button
                        key={product}
                        onClick={() => scrollToSection('products')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        {product}
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
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {policies.map((policy) => (
                      <button
                        key={policy}
                        onClick={() => scrollToSection('policies')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        {policy}
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
                href="/login"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
              >
                Login
              </a>
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
                href="/login"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Login
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar