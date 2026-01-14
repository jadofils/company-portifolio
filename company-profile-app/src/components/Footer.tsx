'use client'

import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-max section-padding py-8">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">
            © 2024 MineralsCorp. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Website by <span className="font-medium">Infoface</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer