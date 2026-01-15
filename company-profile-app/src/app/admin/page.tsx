'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, Settings, Save, User, Building, Share2, Lock, ChevronDown, Mail, Trash2, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface UploadedImage {
  id: number
  filename: string
  original_name: string
  section: string
  subsection: string | null
  title: string | null
  file_path: string
  uploaded_at: string
}

interface CompanySettings {
  company_name: string
  company_logo: string
  company_address: string
  company_phone: string
  company_email: string
  footer_description: string
  facebook_url: string
  twitter_url: string
  linkedin_url: string
  instagram_url: string
  youtube_url: string
}

interface ContactMessage {
  id: number
  name: string
  email: string
  company: string | null
  message: string
  created_at: string
  status: string
}

interface Publication {
  id: number
  title: string
  description: string | null
  content: string | null
  pdf_path: string | null
  published_date: string
  created_at: string
}

interface ContentItem {
  id: number
  section: string
  subsection: string | null
  title: string
  content: string
  image_url: string | null
  updated_at: string
}

interface DisplayItem {
  id?: number
  section?: string
  subsection?: string | null
  title: string
  content: string
  image_url?: string | null
  updated_at?: string
  isStatic: boolean
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('images')
  const [activeSettingsTab, setActiveSettingsTab] = useState('company')
  const [selectedSection, setSelectedSection] = useState('hero')
  const [selectedSubsection, setSelectedSubsection] = useState('')
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [availableSubsections, setAvailableSubsections] = useState<{[key: string]: string[]}>({})
  const [contentForm, setContentForm] = useState({
    section: 'about',
    subsection: '',
    title: '',
    content: '',
    image_url: ''
  })
  const [contentFilter, setContentFilter] = useState<'all' | 'static' | 'database'>('all')
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [publicationForm, setPublicationForm] = useState({
    title: '',
    description: '',
    content: '',
    published_date: new Date().toISOString().split('T')[0]
  })
  const [publicationMode, setPublicationMode] = useState<'form' | 'pdf'>('form')
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '',
    company_logo: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    footer_description: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: ''
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [logoUploadMode, setLogoUploadMode] = useState<'url' | 'upload'>('url')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [savingSettings, setSavingSettings] = useState(false)

  const sidebarItems = [
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const settingsTabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'security', label: 'Security', icon: Lock }
  ]

  const sections = [
    { value: 'hero', label: 'Hero Section', subsections: ['mining-operation', 'mining-equipment', 'gold-minerals', 'industrial-mining'] },
    { value: 'about', label: 'About Us', subsections: ['corporate-governance', 'our-history', 'leadership-team', 'mission-vision', 'sustainability'] },
    { value: 'services', label: 'Services', subsections: ['sourcing', 'testing-analysis', 'crushing', 'tagging', 'packing', 'loading', 'shipping'] },
    { value: 'products', label: 'Products', subsections: ['coltan', 'cassiterite', 'tungsten'] },
    { value: 'policies', label: 'Policies', subsections: ['environmental-policy', 'safety-standards', 'quality-assurance', 'compliance'] }
  ]

  const fetchImages = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedSection) params.append('section', selectedSection)
      if (selectedSubsection) params.append('subsection', selectedSubsection)
      
      const response = await fetch(`/api/images?${params}`)
      const data = await response.json()
      setImages(data.images || [])
    } catch (error) {
      console.error('Failed to fetch images:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/contact')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchPublications = async () => {
    try {
      const response = await fetch('/api/publications')
      const data = await response.json()
      setPublications(data.publications || [])
    } catch (error) {
      console.error('Failed to fetch publications:', error)
    }
  }

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content')
      const data = await response.json()
      setContentItems(data.content || [])
      
      // Default subsections if no content exists
      const defaultSubsections = {
        about: ['corporate-governance', 'our-history', 'leadership-team', 'mission-vision', 'sustainability'],
        services: ['sourcing', 'testing-analysis', 'crushing', 'tagging', 'packing', 'loading', 'shipping'],
        products: ['coltan', 'cassiterite', 'tungsten'],
        policies: ['environmental-policy', 'safety-standards', 'quality-assurance', 'compliance']
      }
      
      // Extract unique subsections per section
      const subsections: {[key: string]: string[]} = {}
      data.content?.forEach((item: ContentItem) => {
        if (item.subsection) {
          if (!subsections[item.section]) subsections[item.section] = []
          if (!subsections[item.section].includes(item.subsection)) {
            subsections[item.section].push(item.subsection)
          }
        }
      })
      
      // Use defaults if no subsections exist for a section
      Object.keys(defaultSubsections).forEach(section => {
        if (!subsections[section] || subsections[section].length === 0) {
          subsections[section] = defaultSubsections[section as keyof typeof defaultSubsections]
        }
      })
      
      setAvailableSubsections(subsections)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [selectedSection, selectedSubsection])

  useEffect(() => {
    fetchSettings()
    fetchMessages()
    fetchPublications()
    fetchContent()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedSection) {
      alert('Please select a section first')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('section', selectedSection)
    if (selectedSubsection) formData.append('subsection', selectedSubsection)
    if (title) formData.append('title', title)

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        alert('Image uploaded successfully!')
        // Clear form
        setTitle('')
        setSelectedSubsection('')
        event.target.value = ''
        fetchImages()
        window.location.reload()
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    }
    setUploading(false)
  }

  const handleUrlSubmit = async () => {
    if (!imageUrl || !selectedSection) {
      alert('Please provide image URL and select a section')
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          section: selectedSection,
          subsection: selectedSubsection,
          title
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Image URL saved successfully!')
        // Clear form
        setTitle('')
        setImageUrl('')
        setSelectedSubsection('')
        fetchImages()
        window.location.reload()
      } else {
        alert('Save failed: ' + result.error)
      }
    } catch (error) {
      console.error('URL save error:', error)
      alert('Save failed')
    }
    setUploading(false)
  }

  const handleSettingsUpdate = async () => {
    console.log('Starting settings update...')
    console.log('Current settings:', settings)
    
    if (!validateCompanySettings()) {
      console.log('Validation failed')
      return
    }
    
    setSavingSettings(true)
    try {
      console.log('Sending PUT request to /api/settings')
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)
      
      if (result.success) {
        alert('Settings updated successfully! The system will refresh to apply changes.')
        // Force refresh to apply all changes across the system
        window.location.reload()
      } else {
        alert('Update failed: ' + result.error)
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert('Update failed: Network error')
    } finally {
      setSavingSettings(false)
    }
  }

  const validateCompanySettings = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!settings.company_name.trim()) newErrors.company_name = 'Company name is required'
    if (!settings.company_email.trim()) newErrors.company_email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.company_email)) newErrors.company_email = 'Invalid email format'
    if (!settings.company_phone.trim()) newErrors.company_phone = 'Phone is required'
    if (!settings.company_address.trim()) newErrors.company_address = 'Address is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSocialSettings = () => {
    const newErrors: {[key: string]: string} = {}
    const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/.*)?$/
    
    if (settings.facebook_url && settings.facebook_url !== '#' && !urlPattern.test(settings.facebook_url)) {
      newErrors.facebook_url = 'Invalid URL format'
    }
    if (settings.twitter_url && settings.twitter_url !== '#' && !urlPattern.test(settings.twitter_url)) {
      newErrors.twitter_url = 'Invalid URL format'
    }
    if (settings.linkedin_url && settings.linkedin_url !== '#' && !urlPattern.test(settings.linkedin_url)) {
      newErrors.linkedin_url = 'Invalid URL format'
    }
    if (settings.instagram_url && settings.instagram_url !== '#' && !urlPattern.test(settings.instagram_url)) {
      newErrors.instagram_url = 'Invalid URL format'
    }
    if (settings.youtube_url && settings.youtube_url !== '#' && !urlPattern.test(settings.youtube_url)) {
      newErrors.youtube_url = 'Invalid URL format'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'admin_password', value: newPassword })
      })

      const result = await response.json()
      if (result.success) {
        alert('Password updated successfully! Please log in again.')
        // Clear password form and redirect to login
        setNewPassword('')
        setConfirmPassword('')
        await fetch('/api/logout', { method: 'POST' })
        window.location.href = '/login'
      } else {
        alert('Password update failed: ' + result.error)
      }
    } catch (error) {
      console.error('Password update error:', error)
      alert('Password update failed')
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    
    // First, delete existing logo from database
    try {
      await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'logo' })
      })
    } catch (error) {
      console.log('No existing logo to delete')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('section', 'logo')
    formData.append('title', 'Company Logo')

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        // Update settings with new logo path
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'company_logo', value: result.path })
        })
        
        setSettings({...settings, company_logo: result.path})
        alert('Logo uploaded successfully!')
        window.location.reload()
      } else {
        alert('Logo upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Logo upload error:', error)
      alert('Logo upload failed')
    }
    setUploadingLogo(false)
  }

  const updateMessageStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      const result = await response.json()
      if (result.success) {
        fetchMessages()
      } else {
        alert('Failed to update message status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Failed to update message status')
    }
  }

  const deleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    
    try {
      const response = await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId })
      })

      const result = await response.json()
      if (result.success) {
        fetchImages()
      } else {
        alert('Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image')
    }
  }

  const handlePublicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicationForm.title) {
      alert('Title is required')
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publicationForm)
      })

      const result = await response.json()
      if (result.success) {
        alert('Publication created successfully!')
        setPublicationForm({ title: '', description: '', content: '', published_date: new Date().toISOString().split('T')[0] })
        fetchPublications()
      } else {
        alert('Failed to create publication: ' + result.error)
      }
    } catch (error) {
      console.error('Publication error:', error)
      alert('Failed to create publication')
    }
    setUploading(false)
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!publicationForm.title) {
      alert('Please enter a title first')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', publicationForm.title)
    if (publicationForm.description) formData.append('description', publicationForm.description)
    formData.append('published_date', publicationForm.published_date)

    try {
      const response = await fetch('/api/publications', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        alert('Publication uploaded successfully!')
        setPublicationForm({ title: '', description: '', content: '', published_date: new Date().toISOString().split('T')[0] })
        event.target.value = ''
        fetchPublications()
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    }
    setUploading(false)
  }

  const deletePublication = async (id: number) => {
    if (!confirm('Are you sure you want to delete this publication?')) return
    
    try {
      const response = await fetch('/api/publications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const result = await response.json()
      if (result.success) {
        fetchPublications()
      } else {
        alert('Failed to delete publication')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete publication')
    }
  }

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contentForm.title || !contentForm.content) {
      alert('Title and content are required')
      return
    }

    setUploading(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing 
        ? JSON.stringify({ ...contentForm, id: editingContent?.id })
        : JSON.stringify(contentForm)

      console.log('Submitting content:', { method, body, isEditing })

      const response = await fetch('/api/content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      })

      const result = await response.json()
      console.log('Content submission result:', result)
      
      if (result.success) {
        alert(isEditing ? 'Content updated successfully!' : 'Content saved successfully!')
        setContentForm({ section: 'about', subsection: '', title: '', content: '', image_url: '' })
        setIsEditing(false)
        setEditingContent(null)
        fetchContent()
      } else {
        console.error('Content save failed:', result)
        alert('Failed to save content: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Content error:', error)
      alert('Failed to save content: Network error')
    }
    setUploading(false)
  }

  const editContent = (item: ContentItem) => {
    setContentForm({
      section: item.section,
      subsection: item.subsection || '',
      title: item.title,
      content: item.content,
      image_url: item.image_url || ''
    })
    setEditingContent(item)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setContentForm({ section: 'about', subsection: '', title: '', content: '', image_url: '' })
    setIsEditing(false)
    setEditingContent(null)
  }

  const deleteContent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    
    console.log('Deleting content with ID:', id)
    
    try {
      const response = await fetch('/api/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const result = await response.json()
      console.log('Delete result:', result)
      
      if (result.success) {
        alert('Content deleted successfully!')
        fetchContent()
      } else {
        console.error('Delete failed:', result)
        alert('Failed to delete content: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete content: Network error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex mt-16">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
            
            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-left rounded transition-colors text-red-600 hover:bg-red-50"
              >
                <User className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
{activeSection === 'images' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Image Management</h3>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-gray-200 rounded p-6">
                    <h4 className="text-lg font-bold mb-4">Upload Image</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                        <select 
                          value={selectedSection} 
                          onChange={(e) => {
                            setSelectedSection(e.target.value)
                            setSelectedSubsection('')
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        >
                          {sections.map(section => (
                            <option key={section.value} value={section.value}>{section.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subsection</label>
                        <select 
                          value={selectedSubsection} 
                          onChange={(e) => setSelectedSubsection(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        >
                          <option value="">Select subsection...</option>
                          {sections.find(s => s.value === selectedSection)?.subsections.map(sub => (
                            <option key={sub} value={sub}>{sub.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
                        <input 
                          type="text" 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          placeholder="Image title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Method</label>
                        <div className="flex space-x-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setUploadMode('file')}
                            className={`px-3 py-1 text-xs rounded ${
                              uploadMode === 'file' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            File Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadMode('url')}
                            className={`px-3 py-1 text-xs rounded ${
                              uploadMode === 'url' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            Image URL
                          </button>
                        </div>
                        
                        {uploadMode === 'file' ? (
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          />
                        ) : (
                          <div className="space-y-3">
                            <input 
                              type="url" 
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                              placeholder="https://example.com/image.jpg"
                            />
                            <button
                              type="button"
                              onClick={handleUrlSubmit}
                              disabled={uploading || !imageUrl}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save Image URL
                            </button>
                          </div>
                        )}
                      </div>

                      {uploading && (
                        <div className="text-center py-4">
                          <div className="inline-flex items-center">
                            <Upload className="animate-spin h-4 w-4 mr-2" />
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Images Gallery */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded p-6">
                    <h4 className="text-lg font-bold mb-4">Uploaded Images</h4>
                    
                    {images.length === 0 ? (
                      <div className="text-center py-8">
                        <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No images uploaded yet</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image) => (
                          <div key={image.id} className="border border-gray-200 rounded overflow-hidden relative group">
                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                              <img 
                                src={image.file_path} 
                                alt={image.title || image.original_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                              <ImageIcon className="h-12 w-12 text-gray-400 hidden" />
                            </div>
                            <button
                              onClick={() => deleteImage(image.id)}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="p-3">
                              <p className="font-medium text-sm truncate">{image.title || image.original_name}</p>
                              <p className="text-xs text-gray-500">{image.section} {image.subsection && `• ${image.subsection}`}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'content' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Content Management</h3>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Content Form */}
                <div>
                  <div className="bg-white border border-gray-200 rounded p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold">{isEditing ? 'Edit Content' : 'Add/Edit Content'}</h4>
                      {isEditing && (
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      <strong>Guide:</strong> You can create new content or update existing ones (including static defaults like "Corporate Governance", "Our History", etc.). 
                      To edit existing content, click the edit button next to any item in the list below.
                    </div>

                    <div className="mb-6">
                      <h5 className="font-medium text-gray-900 mb-3">Content Overview by Section</h5>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        {['about', 'services', 'products', 'policies'].map(section => {
                          const sectionContent = contentItems.filter(item => item.section === section)
                          const staticItems = {
                            about: ['Corporate Governance', 'Our History', 'Leadership Team', 'Mission & Vision', 'Sustainability'],
                            services: ['Sourcing', 'Testing & Analysis', 'Crushing', 'Tagging', 'Packing', 'Loading', 'Shipping'],
                            products: ['Coltan', 'Cassiterite', 'Tungsten'],
                            policies: ['Environmental Policy', 'Safety Standards', 'Quality Assurance', 'Compliance']
                          }[section] || []
                          
                          const dbItems = sectionContent.map(item => item.title)
                          const staticOnly = staticItems.filter(item => !dbItems.includes(item))
                          const customItems = dbItems.filter(item => !staticItems.includes(item))
                          
                          return (
                            <div key={section} className="border border-gray-200 rounded p-3">
                              <h6 className="font-medium capitalize mb-2">{section}</h6>
                              <div className="space-y-1">
                                {staticOnly.length > 0 && (
                                  <div>
                                    <span className="text-gray-500">Static ({staticOnly.length}):</span>
                                    <div className="text-gray-400 text-xs">{staticOnly.join(', ')}</div>
                                  </div>
                                )}
                                {dbItems.filter(item => staticItems.includes(item)).length > 0 && (
                                  <div>
                                    <span className="text-green-600">Customized ({dbItems.filter(item => staticItems.includes(item)).length}):</span>
                                    <div className="text-green-500 text-xs">{dbItems.filter(item => staticItems.includes(item)).join(', ')}</div>
                                  </div>
                                )}
                                {customItems.length > 0 && (
                                  <div>
                                    <span className="text-blue-600">Custom ({customItems.length}):</span>
                                    <div className="text-blue-500 text-xs">{customItems.join(', ')}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    <form onSubmit={handleContentSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                        <select
                          value={contentForm.section}
                          onChange={(e) => setContentForm({...contentForm, section: e.target.value, subsection: ''})}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        >
                          <option value="about">About Us</option>
                          <option value="services">Services</option>
                          <option value="products">Products</option>
                          <option value="policies">Policies</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subsection</label>
                        <div className="space-y-2">
                          <select
                            value={contentForm.subsection}
                            onChange={(e) => setContentForm({...contentForm, subsection: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          >
                            <option value="">Select existing subsection...</option>
                            {availableSubsections[contentForm.section]?.map(sub => (
                              <option key={sub} value={sub}>{sub.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={contentForm.subsection}
                            onChange={(e) => setContentForm({...contentForm, subsection: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                            placeholder="Or create new subsection..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={contentForm.title}
                          onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                        <textarea
                          value={contentForm.content}
                          onChange={(e) => setContentForm({...contentForm, content: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          rows={8}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                        <input
                          type="url"
                          value={contentForm.image_url}
                          onChange={(e) => setContentForm({...contentForm, image_url: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={uploading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {uploading ? 'Saving...' : (isEditing ? 'Update Content' : 'Save Content')}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Content List */}
                <div>
                  <div className="bg-white border border-gray-200 rounded p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold">Existing Content</h4>
                      <div className="flex space-x-2">
                        <select
                          value={contentForm.section}
                          onChange={(e) => setContentForm({...contentForm, section: e.target.value})}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="about">About Us</option>
                          <option value="services">Services</option>
                          <option value="products">Products</option>
                          <option value="policies">Policies</option>
                        </select>
                        <select
                          value={contentFilter}
                          onChange={(e) => setContentFilter(e.target.value as 'all' | 'static' | 'database')}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="all">All Content</option>
                          <option value="static">Static Only</option>
                          <option value="database">Database Only</option>
                        </select>
                      </div>
                    </div>
                    
                    {(() => {
                      const sectionContent = contentItems.filter(item => item.section === contentForm.section)
                      const staticItems = {
                        about: ['Corporate Governance', 'Our History', 'Leadership Team', 'Mission & Vision', 'Sustainability'],
                        services: ['Sourcing', 'Testing & Analysis', 'Crushing', 'Tagging', 'Packing', 'Loading', 'Shipping'],
                        products: ['Coltan', 'Cassiterite', 'Tungsten'],
                        policies: ['Environmental Policy', 'Safety Standards', 'Quality Assurance', 'Compliance']
                      }[contentForm.section] || []
                      
                      const dbItems = sectionContent.map(item => item.title)
                      const staticOnlyItems = staticItems.filter(item => !dbItems.includes(item))
                      
                      let displayItems: DisplayItem[] = []
                      if (contentFilter === 'static') {
                        displayItems = staticOnlyItems.map(title => ({ 
                          isStatic: true, 
                          title, 
                          content: 'Default static content'
                        } as DisplayItem))
                      } else if (contentFilter === 'database') {
                        displayItems = sectionContent.map(item => ({ ...item, isStatic: false } as DisplayItem))
                      } else {
                        displayItems = [
                          ...staticOnlyItems.map(title => ({ 
                            isStatic: true, 
                            title, 
                            content: 'Default static content'
                          } as DisplayItem)),
                          ...sectionContent.map(item => ({ ...item, isStatic: false } as DisplayItem))
                        ]
                      }
                      
                      return displayItems.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">No {contentFilter === 'all' ? '' : contentFilter + ' '}content for {contentForm.section} section</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {displayItems.map((item, index) => (
                            <div key={item.isStatic ? `static-${item.title}` : item.id} className="border border-gray-200 rounded p-4 relative group">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-gray-900">{item.title}</h5>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    item.isStatic ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    {item.isStatic ? 'Static' : 'Database'}
                                  </span>
                                </div>
                                {!item.isStatic && 'id' in item && item.id && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => editContent(item as ContentItem)}
                                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteContent(item.id!)}
                                      className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{item.content}</p>
                              {!item.isStatic && 'section' in item && 'updated_at' in item && item.section && item.updated_at && (
                                <>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{item.section} {'subsection' in item && item.subsection && `• ${item.subsection}`}</span>
                                    <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                                  </div>
                                  {'image_url' in item && item.image_url && (
                                    <div className="mt-2">
                                      <img src={item.image_url} alt={item.title} className="w-full h-[60vh] object-cover rounded" />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'publications' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Publications Management</h3>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Create Publication Form */}
                <div>
                  <div className="bg-white border border-gray-200 rounded p-6 mb-6">
                    <h4 className="text-lg font-bold mb-4">Create Publication</h4>
                    
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setPublicationMode('form')}
                        className={`px-3 py-1 text-xs rounded ${
                          publicationMode === 'form' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Text Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublicationMode('pdf')}
                        className={`px-3 py-1 text-xs rounded ${
                          publicationMode === 'pdf' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        PDF Upload
                      </button>
                    </div>

                    <form onSubmit={handlePublicationSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={publicationForm.title}
                          onChange={(e) => setPublicationForm({...publicationForm, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={publicationForm.description}
                          onChange={(e) => setPublicationForm({...publicationForm, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label>
                        <input
                          type="date"
                          value={publicationForm.published_date}
                          onChange={(e) => setPublicationForm({...publicationForm, published_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        />
                      </div>

                      {publicationMode === 'form' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <textarea
                            value={publicationForm.content}
                            onChange={(e) => setPublicationForm({...publicationForm, content: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                            rows={8}
                          />
                          <button
                            type="submit"
                            disabled={uploading}
                            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {uploading ? 'Creating...' : 'Create Publication'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handlePdfUpload}
                            disabled={uploading}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          />
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Publications List */}
                <div>
                  <div className="bg-white border border-gray-200 rounded p-6">
                    <h4 className="text-lg font-bold mb-4">Published Content</h4>
                    
                    {publications.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No publications created yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {publications.map((publication) => (
                          <div key={publication.id} className="border border-gray-200 rounded p-4 relative group">
                            <button
                              onClick={() => deletePublication(publication.id)}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <h5 className="font-medium text-gray-900 mb-2">{publication.title}</h5>
                            {publication.description && (
                              <p className="text-sm text-gray-600 mb-2">{publication.description}</p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Published: {new Date(publication.published_date).toLocaleDateString()}</span>
                              <span>{publication.pdf_path ? 'PDF' : 'Text'}</span>
                            </div>
                            {publication.pdf_path && (
                              <a
                                href={publication.pdf_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View PDF
                              </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'messages' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Messages</h3>
              <div className="bg-white border border-gray-200 rounded p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No messages received yet</p>
        </div>
) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`border rounded p-4 ${
                        message.status === 'unread' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{message.name}</h4>
                            <p className="text-sm text-gray-600">{message.email}</p>
                            {message.company && (
                              <p className="text-sm text-gray-500">{message.company}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              message.status === 'unread' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {message.status}
                            </span>
                            <button
                              onClick={() => updateMessageStatus(
                                message.id, 
                                message.status === 'unread' ? 'read' : 'unread'
                              )}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark as {message.status === 'unread' ? 'read' : 'unread'}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{message.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Settings</h3>
                
                {/* Settings Tabs Dropdown */}
                <div className="relative">
                  <select
                    value={activeSettingsTab}
                    onChange={(e) => setActiveSettingsTab(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500 bg-white"
                  >
                    {settingsTabs.map(tab => (
                      <option key={tab.id} value={tab.id}>{tab.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Settings Content */}
              <div className="bg-white border border-gray-200 rounded p-6">
                {activeSettingsTab === 'company' && (
                  <div>
                    <h4 className="text-lg font-bold mb-4">Company Information</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                          <input 
                            type="text" 
                            value={settings.company_name}
                            onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-gray-500 ${
                              errors.company_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                          <div className="space-y-3">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setLogoUploadMode('url')}
                                className={`px-3 py-1 text-xs rounded ${
                                  logoUploadMode === 'url' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setLogoUploadMode('upload')}
                                className={`px-3 py-1 text-xs rounded ${
                                  logoUploadMode === 'upload' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                Upload
                              </button>
                            </div>
                            
                            {logoUploadMode === 'url' ? (
                              <input 
                                type="text" 
                                value={settings.company_logo}
                                onChange={(e) => setSettings({...settings, company_logo: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                                placeholder="/logo.png or https://example.com/logo.png"
                              />
                            ) : (
                              <div>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleLogoUpload}
                                  disabled={uploadingLogo}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                                />
                                {uploadingLogo && (
                                  <div className="text-center py-2">
                                    <div className="inline-flex items-center text-sm text-gray-600">
                                      <Upload className="animate-spin h-4 w-4 mr-2" />
                                      Uploading logo...
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {settings.company_logo && (
                              <div className="mt-2">
                                <img 
                                  src={settings.company_logo} 
                                  alt="Company Logo Preview" 
                                  className="h-12 w-auto border border-gray-200 rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input 
                            type="text" 
                            value={settings.company_phone}
                            onChange={(e) => setSettings({...settings, company_phone: e.target.value})}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-gray-500 ${
                              errors.company_phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.company_phone && <p className="text-red-500 text-xs mt-1">{errors.company_phone}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input 
                            type="email" 
                            value={settings.company_email}
                            onChange={(e) => setSettings({...settings, company_email: e.target.value})}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-gray-500 ${
                              errors.company_email ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.company_email && <p className="text-red-500 text-xs mt-1">{errors.company_email}</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <textarea 
                            value={settings.company_address}
                            onChange={(e) => setSettings({...settings, company_address: e.target.value})}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-gray-500 ${
                              errors.company_address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            rows={3}
                          />
                          {errors.company_address && <p className="text-red-500 text-xs mt-1">{errors.company_address}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Footer Description</label>
                          <textarea 
                            value={settings.footer_description}
                            onChange={(e) => setSettings({...settings, footer_description: e.target.value})}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-gray-500 ${
                              errors.footer_description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            rows={4}
                          />
                          {errors.footer_description && <p className="text-red-500 text-xs mt-1">{errors.footer_description}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        onClick={handleSettingsUpdate}
                        disabled={savingSettings}
                        className="btn-primary flex items-center disabled:opacity-50"
                      >
                        <Save className={`h-4 w-4 mr-2 ${savingSettings ? 'animate-spin' : ''}`} />
                        {savingSettings ? 'Saving...' : 'Save Company Settings'}
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'social' && (
                  <div>
                    <h4 className="text-lg font-bold mb-4">Social Media Links</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                          <input 
                            type="url" 
                            value={settings.facebook_url}
                            onChange={(e) => setSettings({...settings, facebook_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                          <input 
                            type="url" 
                            value={settings.twitter_url}
                            onChange={(e) => setSettings({...settings, twitter_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                          <input 
                            type="url" 
                            value={settings.linkedin_url}
                            onChange={(e) => setSettings({...settings, linkedin_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                          <input 
                            type="url" 
                            value={settings.instagram_url}
                            onChange={(e) => setSettings({...settings, instagram_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                          <input 
                            type="url" 
                            value={settings.youtube_url}
                            onChange={(e) => setSettings({...settings, youtube_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        onClick={() => {
                          if (validateSocialSettings()) {
                            handleSettingsUpdate()
                          }
                        }}
                        disabled={savingSettings}
                        className="btn-primary flex items-center disabled:opacity-50"
                      >
                        <Save className={`h-4 w-4 mr-2 ${savingSettings ? 'animate-spin' : ''}`} />
                        {savingSettings ? 'Saving...' : 'Save Social Media Settings'}
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'security' && (
                  <div>
                    <h4 className="text-lg font-bold mb-4">Change Password</h4>
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button 
                        onClick={handlePasswordChange}
                        className="btn-primary"
                        disabled={!newPassword || !confirmPassword}
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}