'use client'

import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Instagram, Youtube } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'

const Footer = () => {
  const { settings } = useSettings()
  const { getThemeClasses } = useTheme()
  const themeClasses = getThemeClasses
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className={`${themeClasses.primaryBg}`}>
      <div className="container-max section-padding py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">{settings.company_name}</h3>
            <p className={`${themeClasses.textSecondary} mb-4 text-sm leading-relaxed`}>
              {settings.footer_description}
            </p>
            <div className="flex space-x-4">
              <a href={settings.facebook_url} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                <Facebook className="h-5 w-5" />
              </a>
              <a href={settings.twitter_url} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                <Twitter className="h-5 w-5" />
              </a>
              <a href={settings.linkedin_url} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href={settings.instagram_url} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                <Instagram className="h-5 w-5" />
              </a>
              <a href={settings.youtube_url} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => scrollToSection('home')} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('products')} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('policies')} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                  Policies
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 text-white">Our Services</h4>
            <ul className={`space-y-2 text-sm ${themeClasses.textSecondary}`}>
              <li>Mineral Sourcing</li>
              <li>Testing & Analysis</li>
              <li>Crushing & Processing</li>
              <li>Quality Assurance</li>
              <li>Packaging & Shipping</li>
              <li>Compliance Management</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4 text-white">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className={`h-4 w-4 mt-1 ${themeClasses.textSecondary} flex-shrink-0`} />
                <span className={`${themeClasses.textSecondary} whitespace-pre-line`}>
                  {settings.company_address}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className={`h-4 w-4 ${themeClasses.textSecondary}`} />
                <span className={themeClasses.textSecondary}>{settings.company_phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className={`h-4 w-4 ${themeClasses.textSecondary}`} />
                <span className={themeClasses.textSecondary}>{settings.company_email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#6594B1] mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`${themeClasses.textSecondary} text-sm mb-4 md:mb-0`}>
              © 2024 {settings.company_name}. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                Privacy Policy
              </a>
              <a href="#" className={`${themeClasses.textSecondary} hover:text-white transition-colors`}>
                Terms of Service
              </a>
              <span className={themeClasses.textSecondary}>
                Website by <span className="font-medium text-white">Infoface</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer