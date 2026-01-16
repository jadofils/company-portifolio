'use client'

import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'

const ContactSection = () => {
  const { settings } = useSettings()
  const { getThemeClasses } = useTheme()
  const themeClasses = getThemeClasses
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', company: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
    }
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className={`${themeClasses.spacing} ${themeClasses.background}`}>
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Contact Us
          </h2>
          <p className="section-subtitle">
            Ready to discuss your mineral processing needs? Get in touch with our experts today.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-6">Get In Touch</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-secondary-900">Email</h4>
                  <p className="text-secondary-600">{settings.company_email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-secondary-900">Phone</h4>
                  <p className="text-secondary-600">{settings.company_phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-secondary-900">Address</h4>
                  <div className="text-secondary-600 whitespace-pre-line">{settings.company_address}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 ${themeClasses.input} ${themeClasses.radius} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 ${themeClasses.input} ${themeClasses.radius} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 ${themeClasses.input} ${themeClasses.radius} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label htmlFor="message" className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 ${themeClasses.input} ${themeClasses.radius} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${themeClasses.buttonPrimary} ${themeClasses.radius} px-4 py-3 flex items-center justify-center gap-2 text-lg disabled:opacity-50`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="h-5 w-5" />
              </button>
              
              {submitStatus === 'success' && (
                <div className="text-center text-green-600 font-medium">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="text-center text-red-600 font-medium">
                  Failed to send message. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection