'use client'

import { useState, useEffect } from 'react'
import { Calendar, FileText, Ticket, X } from 'lucide-react'
import { sql } from '@/lib/database-vercel'

interface Publication {
  id: number
  title: string
  description: string
  content?: string
  pdf_path?: string
  published_date: string
  created_at: string
}

const PublicationsSection = () => {
  const [publications, setPublications] = useState<Publication[]>([])
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' })

  // Load publications from database
  useEffect(() => {
    const loadPublications = async () => {
      try {
        const response = await fetch('/api/publications')
        const data = await response.json()
        setPublications(data.publications || [])
      } catch (error) {
        console.error('Error loading publications:', error)
      }
    }
    
    loadPublications()
  }, [])

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const isUpcoming = (dateString: string) => {
    const publicationDate = new Date(dateString)
    const today = new Date()
    return publicationDate > today
  }

  const handleBookTicket = (publication: Publication) => {
    setContactForm({
      ...contactForm,
      message: `I would like to book a ticket for "${publication.title}" scheduled for ${new Date(publication.published_date).toLocaleDateString()}. Please provide booking details and pricing information.`
    })
    setShowContactForm(true)
  }

  const handleReadMore = (publication: Publication) => {
    // Navigate to a dedicated page instead of modal
    window.open(`/publications/${publication.id}`, '_blank')
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      })
      
      if (response.ok) {
        alert('Booking request sent successfully! We will contact you soon.')
        setShowContactForm(false)
        setContactForm({ name: '', email: '', company: '', message: '' })
      } else {
        alert('Failed to send booking request. Please try again.')
      }
    } catch (error) {
      alert('Error sending booking request. Please try again.')
    }
  }

  return (
    <section id="publications" className="py-20 bg-white">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Publications & Events</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with our latest research publications and upcoming industry events
          </p>
        </div>

        {/* Publications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publications.map((publication) => (
            <div key={publication.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Publication Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(publication.published_date).toLocaleDateString()}
                  {isUpcoming(publication.published_date) && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ml-2">
                      Upcoming
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{publication.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {truncateText(publication.description || '', 120)}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="p-6 pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReadMore(publication)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Read More
                  </button>
                  {isUpcoming(publication.published_date) && (
                    <button
                      onClick={() => handleBookTicket(publication)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Ticket className="h-4 w-4" />
                      Book Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {publications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No publications available at the moment.</p>
          </div>
        )}
      </div>

      {/* Contact Form Modal for Booking */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Book Ticket</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PublicationsSection