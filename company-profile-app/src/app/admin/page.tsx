'use client'

import { useState, useEffect, useMemo } from 'react'
import { Upload, Image as ImageIcon, Settings, Save, User, Building, Share2, Lock, ChevronDown, Mail, Trash2, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTheme } from '@/hooks/useTheme'
import { validateHexColor, sanitizeColor } from '@/utils/validation'

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
  // Theme settings
  theme_mode: 'light' | 'dark'
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_size: 'small' | 'medium' | 'large'
  font_family: string
  section_spacing: 'compact' | 'normal' | 'spacious'
  border_radius: 'none' | 'small' | 'medium' | 'large'
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
  const { refreshTheme, getThemeClasses } = useTheme()
  const themeClasses = getThemeClasses
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
    title: 'About Us', // Default to section name
    content: '',
    image_url: ''
  })
  const [contentFilter, setContentFilter] = useState<'all' | 'static' | 'database'>('all')
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
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
    youtube_url: '',
    // Theme defaults
    theme_mode: 'light',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    accent_color: '#059669',
    background_color: '#ffffff',
    text_color: '#1f2937',
    font_size: 'medium',
    font_family: 'Inter, sans-serif',
    section_spacing: 'normal',
    border_radius: 'medium'
  })
  const [logoImages, setLogoImages] = useState<UploadedImage[]>([])
  const [allImages, setAllImages] = useState<UploadedImage[]>([])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [logoInputMode, setLogoInputMode] = useState<'url' | 'upload' | 'select'>('url')
  const [updatingLogo, setUpdatingLogo] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [savingSettings, setSavingSettings] = useState(false)
  const [contentImageFile, setContentImageFile] = useState<File | null>(null)
  const [uploadingContentImage, setUploadingContentImage] = useState(false)

  const sidebarItems = [
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const [publicationForm, setPublicationForm] = useState({
    title: '',
    description: '',
    content: '',
    published_date: new Date().toISOString().split('T')[0]
  })

  const handleContentImageUpload = async (file: File) => {
    if (!file) return null
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return null
    }
    
    setUploadingContentImage(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('section', contentForm.section)
    if (contentForm.subsection) formData.append('subsection', contentForm.subsection)
    formData.append('title', `${contentForm.title} - Image`)

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        return result.path
      } else {
        alert('Image upload failed: ' + result.error)
        return null
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Image upload failed')
      return null
    } finally {
      setUploadingContentImage(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const settingsTabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'theme', label: 'Theme & Style', icon: Settings },
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
      
      // Static subsections with their display titles
      const staticSubsections = {
        about: [
          { id: 'corporate-governance', title: 'Corporate Governance' },
          { id: 'our-history', title: 'Our History' },
          { id: 'leadership-team', title: 'Leadership Team' },
          { id: 'mission-vision', title: 'Mission & Vision' },
          { id: 'sustainability', title: 'Sustainability' }
        ],
        services: [
          { id: 'sourcing', title: 'Sourcing' },
          { id: 'testing-analysis', title: 'Testing & Analysis' },
          { id: 'crushing', title: 'Crushing' },
          { id: 'tagging', title: 'Tagging' },
          { id: 'packing', title: 'Packing' },
          { id: 'loading', title: 'Loading' },
          { id: 'shipping', title: 'Shipping' }
        ],
        products: [
          { id: 'coltan', title: 'Coltan' },
          { id: 'cassiterite', title: 'Cassiterite' },
          { id: 'tungsten', title: 'Tungsten' }
        ],
        policies: [
          { id: 'environmental-policy', title: 'Environmental Policy' },
          { id: 'safety-standards', title: 'Safety Standards' },
          { id: 'quality-assurance', title: 'Quality Assurance' },
          { id: 'compliance', title: 'Compliance' }
        ]
      }
      
      // Combine static and dynamic subsections with deduplication
      const subsections: {[key: string]: string[]} = {}
      
      Object.keys(staticSubsections).forEach(section => {
        const staticItems = staticSubsections[section as keyof typeof staticSubsections]
        const dynamicItems = (data.content || []).filter((item: ContentItem) => 
          item.section === section && item.subsection
        )
        
        // Start with static subsections
        const combined = [...staticItems.map(item => item.id)]
        
        // Add dynamic subsections that don't duplicate static ones
        dynamicItems.forEach((item: ContentItem) => {
          if (item.subsection) {
            // Check if this dynamic item duplicates a static one (by title or normalized title)
            const isDuplicate = staticItems.some(staticItem => 
              staticItem.title === item.title ||
              staticItem.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') === item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') ||
              staticItem.id === item.subsection
            )
            
            if (!isDuplicate && !combined.includes(item.subsection)) {
              combined.push(item.subsection)
            }
          }
        })
        
        subsections[section] = combined
      })
      
      setAvailableSubsections(subsections)
    } catch (error) {
      // console.error('Failed to fetch content:', error)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [selectedSection, selectedSubsection])

  const fetchAllImages = async () => {
    try {
      const response = await fetch('/api/images')
      const data = await response.json()
      setAllImages(data.images || [])
      
      // Filter logo images
      const logos = (data.images || []).filter((img: UploadedImage) => img.section === 'logo')
      setLogoImages(logos)
    } catch (error) {
      console.error('Failed to fetch all images:', error)
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchMessages()
    fetchPublications()
    fetchContent()
    fetchAllImages()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      event.target.value = ''
      return
    }

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
        window.dispatchEvent(new CustomEvent('contentUpdated'))
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
        window.dispatchEvent(new CustomEvent('contentUpdated'))
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
    if (!validateCompanyInfo()) {
      return
    }
    
    setSavingSettings(true)
    try {
      // Ensure all values are properly serialized
      const settingsToSend = {
        ...settings,
        // Ensure all values are strings or proper types
        company_name: settings?.company_name || '',
        company_logo: settings?.company_logo || '',
        company_address: settings?.company_address || '',
        company_phone: settings?.company_phone || '',
        company_email: settings?.company_email || '',
        footer_description: settings?.footer_description || '',
        facebook_url: settings?.facebook_url || '',
        twitter_url: settings?.twitter_url || '',
        linkedin_url: settings?.linkedin_url || '',
        instagram_url: settings?.instagram_url || '',
        youtube_url: settings?.youtube_url || '',
        theme_mode: settings?.theme_mode || 'light',
        primary_color: settings?.primary_color || '#2563eb',
        secondary_color: settings?.secondary_color || '#64748b',
        accent_color: settings?.accent_color || '#059669',
        background_color: settings?.background_color || '#ffffff',
        text_color: settings?.text_color || '#1f2937',
        font_size: settings?.font_size || 'medium',
        font_family: settings?.font_family || 'Inter, sans-serif',
        section_spacing: settings?.section_spacing || 'normal',
        border_radius: settings?.border_radius || 'medium'
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(settingsToSend)
      })

      const result = await response.json()
      
      if (result.success) {
        if (activeSettingsTab === 'theme') {
          await refreshTheme()
          window.dispatchEvent(new CustomEvent('themeUpdated'))
        }
        alert('Settings updated successfully!')
        if (activeSettingsTab !== 'theme') {
          window.location.reload()
        }
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

  const nonLogoImages = useMemo(() => 
    allImages.filter(img => img.section !== 'logo'), [allImages])

  const themePreviewStyle = useMemo(() => ({
    backgroundColor: settings?.theme_mode === 'dark' ? '#1f2937' : sanitizeColor(settings?.background_color || '#ffffff'),
    color: settings?.theme_mode === 'dark' ? '#f9fafb' : sanitizeColor(settings?.text_color || '#0f172a'),
    fontFamily: settings?.font_family || 'Inter, sans-serif',
    fontSize: settings?.font_size === 'small' ? '14px' : settings?.font_size === 'large' ? '18px' : '16px',
    borderRadius: settings?.border_radius === 'none' ? '0' : settings?.border_radius === 'small' ? '4px' : settings?.border_radius === 'large' ? '12px' : '8px'
  }), [settings])

  const validateCompanySettings = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!validateHexColor(settings.primary_color)) newErrors.primary_color = 'Invalid hex color format'
    if (!validateHexColor(settings.secondary_color)) newErrors.secondary_color = 'Invalid hex color format'
    if (!validateHexColor(settings.accent_color)) newErrors.accent_color = 'Invalid hex color format'
    if (!validateHexColor(settings.background_color)) newErrors.background_color = 'Invalid hex color format'
    if (!validateHexColor(settings.text_color)) newErrors.text_color = 'Invalid hex color format'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCompanyInfo = () => {
    const newErrors: {[key: string]: string} = {}
    
    // Company name is now optional
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

  const handleLogoUpdate = async () => {
    if (!settings?.company_logo) {
      alert('Please select or enter a logo first')
      return
    }

    setUpdatingLogo(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const result = await response.json()
      if (result.success) {
        alert('Logo updated successfully!')
        window.dispatchEvent(new CustomEvent('contentUpdated'))
        // Refresh the page to show updated logo
        window.location.reload()
      } else {
        alert('Logo update failed: ' + result.error)
      }
    } catch (error) {
      console.error('Logo update error:', error)
      alert('Logo update failed')
    } finally {
      setUpdatingLogo(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      event.target.value = ''
      return
    }

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
        
        setSettings({...(settings ?? {}), company_logo: result.path})
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
      let imageUrl = contentForm.image_url
      
      // Upload image if file is selected and creating new subsection
      if (contentImageFile && !isEditing && contentForm.subsection && !availableSubsections[contentForm.section]?.includes(contentForm.subsection)) {
        const uploadedImageUrl = await handleContentImageUpload(contentImageFile)
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl
        }
      }

      let method = 'POST'
      let body = JSON.stringify({ ...contentForm, image_url: imageUrl })
      
      if (isEditing && editingContent?.id) {
        // Editing existing content via edit button
        method = 'PUT'
        body = JSON.stringify({ ...contentForm, image_url: imageUrl, id: editingContent.id })
      } else {
        // Determine if we're updating existing content or creating new
        let existingContent = null
        
        if (contentForm.subsection === '') {
          // Main section content (e.g., "About Us" with no subsection)
          existingContent = contentItems.find(item => 
            item.section === contentForm.section && 
            (!item.subsection || item.subsection === null || item.subsection === '')
          )
        } else {
          // Subsection content
          existingContent = contentItems.find(item => 
            item.section === contentForm.section && 
            item.subsection === contentForm.subsection
          )
        }
        
        if (existingContent) {
          // Update existing content
          method = 'PUT'
          body = JSON.stringify({ ...contentForm, image_url: imageUrl, id: existingContent.id })
        }
        // else: Create new content (POST)
      }

      const response = await fetch('/api/content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      })

      const result = await response.json()
      
      if (result.success) {
        const action = method === 'PUT' ? 'updated' : 'created'
        alert(`Content ${action} successfully!`)
        
        // Reset form to default state
        const sectionTitles = {
          'about': 'About Us',
          'services': 'Services', 
          'products': 'Products',
          'policies': 'Policies'
        }
        const defaultTitle = sectionTitles[contentForm.section as keyof typeof sectionTitles] || contentForm.section
        setContentForm({ section: contentForm.section, subsection: '', title: defaultTitle, content: '', image_url: '' })
        setContentImageFile(null)
        setIsEditing(false)
        setIsCreatingNew(false)
        setEditingContent(null)
        await fetchContent()
        window.dispatchEvent(new CustomEvent('contentUpdated'))
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        alert('Failed to save content: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
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
    const sectionTitles = {
      'about': 'About Us',
      'services': 'Services', 
      'products': 'Products',
      'policies': 'Policies'
    }
    const defaultTitle = sectionTitles[contentForm.section as keyof typeof sectionTitles] || contentForm.section
    setContentForm({ section: contentForm.section, subsection: '', title: defaultTitle, content: '', image_url: '' })
    setContentImageFile(null)
    setIsEditing(false)
    setIsCreatingNew(false)
    setEditingContent(null)
  }

  const deleteContent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    
    // console.log('Deleting content with ID:', id)
    
    try {
      const response = await fetch('/api/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const result = await response.json()
      // console.log('Delete result:', result)
      
      if (result.success) {
        alert('Content deleted successfully!')
        fetchContent()
      } else {
        // console.error('Delete failed:', result)
        alert('Failed to delete content: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      // console.error('Delete error:', error)
      alert('Failed to delete content: Network error')
    }
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <Navbar />
      
      <div className="flex flex-col lg:flex-row mt-16">
        {/* Sidebar */}
        <div className={`w-full lg:w-64 ${themeClasses.card} border-r lg:min-h-screen`}>
          <div className="p-6">
            <h2 className={`text-xl font-bold ${themeClasses.textPrimary} mb-6`}>Admin Dashboard</h2>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-left text-sm lg:text-base ${themeClasses.radius} transition-colors ${
                      activeSection === item.id
                        ? `bg-primary text-white font-medium`
                        : `${themeClasses.textSecondary} ${themeClasses.button}`
                    }`}
                  >
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                )
              })}
            </nav>
            
            {/* Logout Button */}
            <div className={`mt-8 pt-6 border-t ${themeClasses.formBorder}`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center px-3 py-2 text-left text-sm lg:text-base ${themeClasses.radius} transition-colors text-red-600 hover:bg-red-50`}
              >
                <User className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
{activeSection === 'images' && (
            <div>
              <h3 className={`text-xl lg:text-2xl font-bold ${themeClasses.textPrimary} mb-4 lg:mb-6`}>Image Management</h3>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
                {/* Upload Form */}
                <div className="xl:col-span-1">
                  <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6`}>
                    <h4 className={`text-lg font-bold ${themeClasses.textPrimary} mb-4`}>Upload Image</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Section</label>
                        <select 
                          value={selectedSection} 
                          onChange={(e) => {
                            setSelectedSection(e.target.value)
                            setSelectedSubsection('')
                          }}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          {sections.map(section => (
                            <option key={section.value} value={section.value}>{section.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Subsection</label>
                        <select 
                          value={selectedSubsection} 
                          onChange={(e) => setSelectedSubsection(e.target.value)}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="">Select subsection...</option>
                          {availableSubsections[selectedSection]?.map(sub => {
                            // Get display title for subsection
                            const getSubsectionTitle = (subsectionId: string) => {
                              // First check if there's database content with a title
                              const dbContent = contentItems.find(item => 
                                item.section === selectedSection && item.subsection === subsectionId
                              )
                              if (dbContent) return dbContent.title
                              
                              // Otherwise format the ID as title
                              return subsectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            }
                            
                            return (
                              <option key={sub} value={sub}>{getSubsectionTitle(sub)}</option>
                            )
                          })}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Title (Optional)</label>
                        <input 
                          type="text" 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Image title"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Upload Method</label>
                        <div className="flex space-x-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setUploadMode('file')}
                            className={`px-3 py-1 text-xs ${themeClasses.radius} ${
                              uploadMode === 'file' ? `${themeClasses.primaryBg} text-white` : `${themeClasses.button}`
                            }`}
                          >
                            File Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadMode('url')}
                            className={`px-3 py-1 text-xs ${themeClasses.radius} ${
                              uploadMode === 'url' ? `${themeClasses.primaryBg} text-white` : `${themeClasses.button}`
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
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        ) : (
                          <div className="space-y-3">
                            <input 
                              type="url" 
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              placeholder="https://example.com/image.jpg"
                            />
                            <button
                              type="button"
                              onClick={handleUrlSubmit}
                              disabled={uploading || !imageUrl}
                              className={`w-full px-4 py-2 ${themeClasses.buttonPrimary} ${themeClasses.radius} disabled:opacity-50`}
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
                <div className="xl:col-span-2">
                  <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6`}>
                    <h4 className={`text-lg font-bold ${themeClasses.textPrimary} mb-4`}>Uploaded Images</h4>
                    
                    {images.length === 0 ? (
                      <div className="text-center py-8">
                        <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No images uploaded yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <h3 className={`text-xl lg:text-2xl font-bold ${themeClasses.textPrimary} mb-4 lg:mb-6`}>Content Management</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-8">
                {/* Content Form */}
                <div>
                  <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6 mb-4 lg:mb-6`}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className={`text-lg font-bold ${themeClasses.textPrimary}`}>{isEditing ? 'Edit Content' : 'Add/Edit Content'}</h4>
                      {isEditing && (
                        <button
                          onClick={cancelEdit}
                          className={`px-3 py-1 text-sm ${themeClasses.button} ${themeClasses.radius} hover:opacity-80`}
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
                      <h5 className="font-medium text-gray-900 mb-3">Quick Edit Static Content</h5>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {['about', 'services', 'products', 'policies'].map(section => {
                          const staticItems = {
                            about: ['Corporate Governance', 'Our History', 'Leadership Team', 'Mission & Vision', 'Sustainability'],
                            services: ['Sourcing', 'Testing & Analysis', 'Crushing', 'Tagging', 'Packing', 'Loading', 'Shipping'],
                            products: ['Coltan', 'Cassiterite', 'Tungsten'],
                            policies: ['Environmental Policy', 'Safety Standards', 'Quality Assurance', 'Compliance']
                          }[section] || []
                          
                          const sectionContent = contentItems.filter(item => item.section === section)
                          const dbItems = sectionContent.map(item => item.title)
                          const staticOnly = staticItems.filter(item => !dbItems.includes(item))
                          
                          return (
                            <div key={section} className="border border-gray-200 rounded p-3">
                              <h6 className="font-medium capitalize mb-2">{section}</h6>
                              <div className="space-y-1">
                                {staticOnly.map(staticTitle => (
                                  <button
                                    key={staticTitle}
                                    onClick={() => {
                                      const subsectionKey = staticTitle.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
                                      setContentForm({
                                        section,
                                        subsection: subsectionKey,
                                        title: staticTitle,
                                        content: `Edit the content for ${staticTitle}. This will override the static default content.`,
                                        image_url: ''
                                      })
                                      setIsEditing(false)
                                      setEditingContent(null)
                                    }}
                                    className="text-left text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    + Edit "{staticTitle}"
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    <form onSubmit={handleContentSubmit} className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Section</label>
                        <select
                          value={contentForm.section}
                          onChange={(e) => {
                            const newSection = e.target.value
                            const sectionTitles = {
                              'about': 'About Us',
                              'services': 'Services', 
                              'products': 'Products',
                              'policies': 'Policies'
                            }
                            const sectionTitle = sectionTitles[newSection as keyof typeof sectionTitles] || newSection
                            setContentForm({...contentForm, section: newSection, subsection: '', title: sectionTitle})
                          }}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="about">About Us</option>
                          <option value="services">Services</option>
                          <option value="products">Products</option>
                          <option value="policies">Policies</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Subsection</label>
                        <div>
                          <select
                            value={contentForm.subsection}
                            onChange={(e) => {
                              const selectedSubsection = e.target.value
                              setContentForm({...contentForm, subsection: selectedSubsection})
                              
                              if (selectedSubsection === '') {
                                // No subsection selected - auto-fill with section name
                                const sectionTitles = {
                                  'about': 'About Us',
                                  'services': 'Services', 
                                  'products': 'Products',
                                  'policies': 'Policies'
                                }
                                const sectionTitle = sectionTitles[contentForm.section as keyof typeof sectionTitles] || contentForm.section
                                setContentForm(prev => ({...prev, title: sectionTitle, subsection: ''}))
                                setIsCreatingNew(false)
                              } else if (selectedSubsection === 'CREATE_NEW') {
                                // Creating new subsection - clear title for user input
                                setContentForm(prev => ({...prev, title: '', subsection: ''}))
                                setIsCreatingNew(true)
                              } else if (availableSubsections[contentForm.section]?.includes(selectedSubsection)) {
                                // Existing subsection selected - auto-fill title
                                const existingContent = contentItems.find(item => 
                                  item.section === contentForm.section && item.subsection === selectedSubsection
                                )
                                const formattedTitle = existingContent?.title || 
                                  selectedSubsection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                setContentForm(prev => ({...prev, title: formattedTitle, subsection: selectedSubsection}))
                                setIsCreatingNew(false)
                              }
                            }}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">-- Select subsection or edit main section --</option>
                            {availableSubsections[contentForm.section]?.map(sub => {
                              // Get display title for subsection
                              const getSubsectionTitle = (subsectionId: string) => {
                                // First check if there's database content with a title
                                const dbContent = contentItems.find(item => 
                                  item.section === contentForm.section && item.subsection === subsectionId
                                )
                                if (dbContent) return dbContent.title
                                
                                // Otherwise format the ID as title
                                return subsectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                              }
                              
                              return (
                                <option key={sub} value={sub}>{getSubsectionTitle(sub)}</option>
                              )
                            })}
                            <option value="CREATE_NEW">+ Create new subsection</option>
                          </select>
                          {(contentForm.subsection === '' && contentForm.title === '') || isCreatingNew ? (
                            <input
                              type="text"
                              value={contentForm.subsection}
                              onChange={(e) => setContentForm({...contentForm, subsection: e.target.value, title: ''})}
                              className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2`}
                              placeholder="Enter new subsection name (e.g., 'new-feature')..."
                            />
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Title</label>
                        <input
                          type="text"
                          value={contentForm.title}
                          onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            (isEditing || 
                             (contentForm.subsection === '' && contentForm.title !== '') || 
                             (contentForm.subsection && availableSubsections[contentForm.section]?.includes(contentForm.subsection))) 
                              ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          readOnly={Boolean(isEditing || 
                                   (contentForm.subsection === '' && contentForm.title !== '') || 
                                   (contentForm.subsection && availableSubsections[contentForm.section]?.includes(contentForm.subsection)))}
                          placeholder={(() => {
                            if (isEditing) return 'Title is auto-filled for existing content'
                            if (contentForm.subsection === '' && contentForm.title !== '') return 'Editing main section content'
                            if (contentForm.subsection && availableSubsections[contentForm.section]?.includes(contentForm.subsection)) return 'Title is auto-filled for existing subsection'
                            return 'Enter title for new content'
                          })()}
                          required
                        />
                        {(isEditing || 
                          (contentForm.subsection === '' && contentForm.title !== '') || 
                          (contentForm.subsection && availableSubsections[contentForm.section]?.includes(contentForm.subsection))) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {contentForm.subsection === '' && contentForm.title !== '' 
                              ? 'Editing main section content. Title is read-only.' 
                              : 'Title is read-only for existing content. To create new content, select "+ Create new subsection".'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Content</label>
                        <textarea
                          value={contentForm.content}
                          onChange={(e) => setContentForm({...contentForm, content: e.target.value})}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          rows={8}
                          required
                        />
                      </div>

                      {/* Show image options for new subsections */}
                      {!isEditing && !availableSubsections[contentForm.section]?.includes(contentForm.subsection) && contentForm.subsection && (
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Image (Optional)</label>
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setContentImageFile(e.target.files?.[0] || null)}
                              className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <div className="text-center text-sm text-gray-500">OR</div>
                            <input
                              type="url"
                              value={contentForm.image_url}
                              onChange={(e) => setContentForm({...contentForm, image_url: e.target.value})}
                              className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          {uploadingContentImage && (
                            <div className="text-center py-2">
                              <div className="inline-flex items-center text-sm text-gray-600">
                                <Upload className="animate-spin h-4 w-4 mr-2" />
                                Uploading image...
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Upload a file or provide an image URL for new subsections. For existing content, manage images through the Images section.</p>
                        </div>
                      )}

                      {/* Show image URL for editing existing content */}
                      {(isEditing || availableSubsections[contentForm.section]?.includes(contentForm.subsection)) && (
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Image URL (Optional)</label>
                          <input
                            type="url"
                            value={contentForm.image_url}
                            onChange={(e) => setContentForm({...contentForm, image_url: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="https://example.com/image.jpg"
                          />
                          <p className="text-xs text-gray-500 mt-1">For existing subsections, update images through the Images section in the sidebar.</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={uploading}
                        className={`w-full px-4 py-2 ${themeClasses.buttonPrimary} ${themeClasses.radius} disabled:opacity-50`}
                      >
                        {uploading ? 'Saving...' : (isCreatingNew ? 'Save New Content' : 'Update Content')}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Content List */}
                <div>
                  <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                      <h4 className={`text-lg font-bold ${themeClasses.textPrimary}`}>Existing Content</h4>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
                        <select
                          value={contentForm.section}
                          onChange={(e) => setContentForm({...contentForm, section: e.target.value})}
                          className={`px-3 py-1 ${themeClasses.input} ${themeClasses.radius} text-sm w-full sm:w-auto`}
                        >
                          <option value="about">About Us</option>
                          <option value="services">Services</option>
                          <option value="products">Products</option>
                          <option value="policies">Policies</option>
                        </select>
                        <select
                          value={contentFilter}
                          onChange={(e) => setContentFilter(e.target.value as 'all' | 'static' | 'database')}
                          className={`px-3 py-1 ${themeClasses.input} ${themeClasses.radius} text-sm w-full sm:w-auto`}
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
                            <div key={item.isStatic ? `static-${item.title}` : item.id} className={`border rounded p-4 relative group ${
                              item.isStatic ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
                            }`}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-gray-900">{item.title}</h5>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    item.isStatic ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                                  }`}>
                                    {item.isStatic ? 'Using Static Default' : 'Using Database Content'}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  {item.isStatic && (
                                    <button
                                      onClick={() => {
                                        const subsectionKey = item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
                                        setContentForm({
                                          section: contentForm.section,
                                          subsection: subsectionKey,
                                          title: item.title,
                                          content: `Edit the content for ${item.title}. This will override the static default content.`,
                                          image_url: ''
                                        })
                                        setIsEditing(false)
                                        setEditingContent(null)
                                      }}
                                      className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      Override Static
                                    </button>
                                  )}
                                  {!item.isStatic && 'id' in item && item.id && (
                                    <>
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
                                    </>
                                  )}
                                </div>
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
              <h3 className={`text-xl lg:text-2xl font-bold ${themeClasses.textPrimary} mb-4 lg:mb-6`}>Publications Management</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-8">
                {/* Create Publication Form */}
                <div>
                  <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6 mb-4 lg:mb-6`}>
                    <h4 className={`text-lg font-bold ${themeClasses.textPrimary} mb-4`}>Create Publication</h4>
                    
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setPublicationMode('form')}
                        className={`px-3 py-1 text-xs ${themeClasses.radius} ${
                          publicationMode === 'form' ? `${themeClasses.primaryBg} text-white` : `${themeClasses.button}`
                        }`}
                      >
                        Text Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublicationMode('pdf')}
                        className={`px-3 py-1 text-xs ${themeClasses.radius} ${
                          publicationMode === 'pdf' ? `${themeClasses.primaryBg} text-white` : `${themeClasses.button}`
                        }`}
                      >
                        PDF Upload
                      </button>
                    </div>

                    <form onSubmit={handlePublicationSubmit} className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Title</label>
                        <input
                          type="text"
                          value={publicationForm.title}
                          onChange={(e) => setPublicationForm({...publicationForm, title: e.target.value})}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Description</label>
                        <textarea
                          value={publicationForm.description}
                          onChange={(e) => setPublicationForm({...publicationForm, description: e.target.value})}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Published Date</label>
                        <input
                          type="date"
                          value={publicationForm.published_date}
                          onChange={(e) => setPublicationForm({...publicationForm, published_date: e.target.value})}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      {publicationMode === 'form' ? (
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Content</label>
                          <textarea
                            value={publicationForm.content}
                            onChange={(e) => setPublicationForm({...publicationForm, content: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            rows={8}
                          />
                          <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full mt-4 px-4 py-2 ${themeClasses.buttonPrimary} ${themeClasses.radius} disabled:opacity-50`}
                          >
                            {uploading ? 'Creating...' : 'Create Publication'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>PDF File</label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handlePdfUpload}
                            disabled={uploading}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Publications List */}
                <div>
                  <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6`}>
                    <h4 className={`text-lg font-bold ${themeClasses.textPrimary} mb-4`}>Published Content</h4>
                    
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
              <h3 className={`text-xl lg:text-2xl font-bold ${themeClasses.textPrimary} mb-4 lg:mb-6`}>Contact Messages</h3>
              <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6`}>
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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 space-y-2 sm:space-y-0">
                          <div>
                            <h4 className="font-medium text-gray-900">{message.name}</h4>
                            <p className="text-sm text-gray-600">{message.email}</p>
                            {message.company && (
                              <p className="text-sm text-gray-500">{message.company}</p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
              <h3 className={`text-xl lg:text-2xl font-bold ${themeClasses.textPrimary}`}>Settings</h3>
                
                {/* Settings Tabs Dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={activeSettingsTab}
                    onChange={(e) => setActiveSettingsTab(e.target.value)}
                    className={`w-full sm:w-auto px-4 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {settingsTabs.map(tab => (
                      <option key={tab.id} value={tab.id}>{tab.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Settings Content */}
              <div className={`${themeClasses.card} ${themeClasses.radius} p-4 lg:p-6`}>
                {activeSettingsTab === 'company' && (
                  <div>
                    <h4 className="text-lg font-bold mb-6">Company Information</h4>
                    
                    {/* Logo Management Section - Separate */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
                      <h5 className="text-md font-semibold text-gray-900 mb-4">Company Logo</h5>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setLogoInputMode('url')}
                            className={`px-3 py-1 text-xs ${themeClasses.radius} ${
                              logoInputMode === 'url' ? `${themeClasses.primaryBg} text-white` : `${themeClasses.button}`
                            }`}
                          >
                            URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoInputMode('upload')}
                            className={`px-3 py-1 text-xs ${themeClasses.radius} ${
                              logoInputMode === 'upload' ? `${themeClasses.primaryBg} text-white` : `${themeClasses.button}`
                            }`}
                          >
                            Upload New
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoInputMode('select')}
                            className={`px-3 py-1 text-xs ${themeClasses.radius} ${
                              logoInputMode === 'select' ? `${themeClasses.primaryBg} text-white` : `${themeClasses.button}`
                            }`}
                          >
                            Select Existing
                          </button>
                        </div>
                        
                        {logoInputMode === 'url' ? (
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={settings?.company_logo ?? ''}
                              onChange={(e) => setSettings({...(settings ?? {}), company_logo: e.target.value})}
                              className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              placeholder="/logo.png or https://example.com/logo.png"
                            />
                          </div>
                        ) : logoInputMode === 'upload' ? (
                          <div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoUpload}
                              disabled={uploadingLogo}
                              className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded p-3">
                              {logoImages.length > 0 && (
                                <div className="col-span-full">
                                  <h6 className="text-sm font-medium text-gray-700 mb-2">Logo Images</h6>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {logoImages.map((img) => (
                                      <div
                                        key={img.id}
                                        onClick={() => setSettings({...(settings ?? {}), company_logo: img.file_path})}
                                        className={`cursor-pointer border-2 rounded p-2 transition-colors ${
                                          settings?.company_logo === img.file_path ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <img src={img.file_path} alt={img.title || img.original_name} className="w-full h-16 object-cover rounded mb-1" />
                                        <p className="text-xs text-center truncate">{img.title || img.original_name}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {nonLogoImages.length > 0 && (
                                <div className="col-span-full">
                                  <h6 className="text-sm font-medium text-gray-700 mb-2 mt-4">Other Images</h6>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {nonLogoImages.map((img) => (
                                      <div
                                        key={img.id}
                                        onClick={() => setSettings({...(settings ?? {}), company_logo: img.file_path})}
                                        className={`cursor-pointer border-2 rounded p-2 transition-colors ${
                                          settings?.company_logo === img.file_path ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <img src={img.file_path} alt={img.title || img.original_name} className="w-full h-16 object-cover rounded mb-1" />
                                        <p className="text-xs text-center truncate">{img.title || img.original_name}</p>
                                        <p className="text-xs text-center text-gray-500">{img.section}{img.subsection ? ` • ${img.subsection}` : ''}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {logoImages.length === 0 && nonLogoImages.length === 0 && (
                                <div className="col-span-full text-center py-4 text-gray-500">
                                  No images available. Upload some images first.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {settings?.company_logo && (
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
                        
                        <button 
                          onClick={handleLogoUpdate}
                          disabled={updatingLogo || !settings?.company_logo}
                          className={`px-4 py-2 ${themeClasses.buttonPrimary} ${themeClasses.radius} disabled:opacity-50 text-sm flex items-center`}
                        >
                          <Save className={`h-4 w-4 mr-2 ${updatingLogo ? 'animate-spin' : ''}`} />
                          {updatingLogo ? 'Updating Logo...' : 'Update Logo'}
                        </button>
                      </div>
                    </div>

                    {/* Company Information Form - Separate */}
                    <div className="bg-white border border-gray-200 rounded p-4">
                      <h5 className="text-md font-semibold text-gray-900 mb-4">Company Details</h5>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Company Name (Optional)</label>
                            <input 
                              type="text" 
                              value={settings?.company_name ?? ''}
                              onChange={(e) => setSettings({...(settings ?? {}), company_name: e.target.value})}
                              className={`w-full px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.company_name ? 'border-red-500' : themeClasses.input
                              }`}
                              placeholder="Company name (will appear in footer)"
                            />
                            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                          </div>

                          <div>
                            <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Phone</label>
                            <input 
                              type="text" 
                              value={settings?.company_phone ?? ''}
                              onChange={(e) => setSettings({...(settings ?? {}), company_phone: e.target.value})}
                              className={`w-full px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.company_phone ? 'border-red-500' : themeClasses.input
                              }`}
                            />
                            {errors.company_phone && <p className="text-red-500 text-xs mt-1">{errors.company_phone}</p>}
                          </div>

                          <div>
                            <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Email</label>
                            <input 
                              type="email" 
                              value={settings?.company_email ?? ''}
                              onChange={(e) => setSettings({...(settings ?? {}), company_email: e.target.value})}
                              className={`w-full px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.company_email ? 'border-red-500' : themeClasses.input
                              }`}
                            />
                            {errors.company_email && <p className="text-red-500 text-xs mt-1">{errors.company_email}</p>}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Address</label>
                            <textarea 
                              value={settings?.company_address ?? ''}
                              onChange={(e) => setSettings({...(settings ?? {}), company_address: e.target.value})}
                              className={`w-full px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.company_address ? 'border-red-500' : themeClasses.input
                              }`}
                              rows={3}
                            />
                            {errors.company_address && <p className="text-red-500 text-xs mt-1">{errors.company_address}</p>}
                          </div>

                          <div>
                            <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Footer Description</label>
                            <textarea 
                              value={settings?.footer_description ?? ''}
                              onChange={(e) => setSettings({...(settings ?? {}), footer_description: e.target.value})}
                              className={`w-full px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.footer_description ? 'border-red-500' : themeClasses.input
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
                          className={`px-4 py-2 ${themeClasses.buttonPrimary} ${themeClasses.radius} disabled:opacity-50 flex items-center`}
                        >
                          <Save className={`h-4 w-4 mr-2 ${savingSettings ? 'animate-spin' : ''}`} />
                          {savingSettings ? 'Saving...' : 'Save Company Information'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'social' && (
                  <div>
                    <h4 className={`text-lg font-bold ${themeClasses.textPrimary} mb-4`}>Social Media Links</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Facebook URL</label>
                          <input 
                            type="url" 
                            value={settings?.facebook_url ?? ''}
                            onChange={(e) => setSettings({...(settings ?? {}), facebook_url: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Twitter URL</label>
                          <input 
                            type="url" 
                            value={settings?.twitter_url ?? ''}
                            onChange={(e) => setSettings({...(settings ?? {}), twitter_url: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>LinkedIn URL</label>
                          <input 
                            type="url" 
                            value={settings?.linkedin_url ?? ''}
                            onChange={(e) => setSettings({...(settings ?? {}), linkedin_url: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Instagram URL</label>
                          <input 
                            type="url" 
                            value={settings?.instagram_url ?? ''}
                            onChange={(e) => setSettings({...(settings ?? {}), instagram_url: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>YouTube URL</label>
                          <input 
                            type="url" 
                            value={settings?.youtube_url ?? ''}
                            onChange={(e) => setSettings({...(settings ?? {}), youtube_url: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                        className={`${themeClasses.buttonPrimary} ${themeClasses.radius} px-4 py-2 flex items-center disabled:opacity-50`}
                      >
                        <Save className={`h-4 w-4 mr-2 ${savingSettings ? 'animate-spin' : ''}`} />
                        {savingSettings ? 'Saving...' : 'Save Social Media Settings'}
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'theme' && (
                  <div>
                    <h4 className={`text-lg font-bold ${themeClasses.textPrimary} mb-4`}>Theme & Style Settings</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      {/* Theme Mode & Colors */}
                      <div className="space-y-4">
                        <h5 className={`font-medium ${themeClasses.textPrimary}`}>Theme & Colors</h5>
                        
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Theme Mode</label>
                          <select
                            value={settings?.theme_mode ?? 'light'}
                            onChange={(e) => setSettings({...(settings ?? {}), theme_mode: e.target.value as 'light' | 'dark'})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Primary Color</label>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                              type="color"
                              value={settings?.primary_color ?? '#2563eb'}
                              onChange={(e) => setSettings({...(settings ?? {}), primary_color: e.target.value})}
                              className="w-full sm:w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings?.primary_color ?? '#1e40af'}
                              onChange={(e) => {
                                const color = sanitizeColor(e.target.value)
                                setSettings({...(settings ?? {}), primary_color: color})
                              }}
                              className={`flex-1 px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.primary_color ? 'border-red-500' : themeClasses.input
                              }`}
                              placeholder="#1e40af"
                            />
                          </div>
                          {errors.primary_color && <p className="text-red-500 text-xs mt-1">{errors.primary_color}</p>}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Secondary Color</label>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                              type="color"
                              value={settings?.secondary_color ?? '#64748b'}
                              onChange={(e) => setSettings({...(settings ?? {}), secondary_color: e.target.value})}
                              className="w-full sm:w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings?.secondary_color ?? '#475569'}
                              onChange={(e) => {
                                const color = sanitizeColor(e.target.value)
                                setSettings({...(settings ?? {}), secondary_color: color})
                              }}
                              className={`flex-1 px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.secondary_color ? 'border-red-500' : themeClasses.input
                              }`}
                              placeholder="#475569"
                            />
                          </div>
                          {errors.secondary_color && <p className="text-red-500 text-xs mt-1">{errors.secondary_color}</p>}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Accent Color</label>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                              type="color"
                              value={settings?.accent_color ?? '#059669'}
                              onChange={(e) => setSettings({...(settings ?? {}), accent_color: e.target.value})}
                              className="w-full sm:w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings?.accent_color ?? '#0f766e'}
                              onChange={(e) => {
                                const color = sanitizeColor(e.target.value)
                                setSettings({...(settings ?? {}), accent_color: color})
                              }}
                              className={`flex-1 px-3 py-2 border ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.accent_color ? 'border-red-500' : themeClasses.input
              }`}
                              placeholder="#0f766e"
                            />
                          </div>
                          {errors.accent_color && <p className="text-red-500 text-xs mt-1">{errors.accent_color}</p>}
                        </div>
                      </div>

                      {/* Typography & Layout */}
                      <div className="space-y-4">
                        <h5 className={`font-medium ${themeClasses.textPrimary}`}>Typography & Layout</h5>
                        
                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Font Size</label>
                          <select
                            value={settings?.font_size ?? 'medium'}
                            onChange={(e) => setSettings({...(settings ?? {}), font_size: e.target.value as 'small' | 'medium' | 'large'})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Font Family</label>
                          <select
                            value={settings?.font_family ?? 'Inter, sans-serif'}
                            onChange={(e) => setSettings({...(settings ?? {}), font_family: e.target.value})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="Inter, sans-serif">Inter (Default)</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Section Spacing</label>
                          <select
                            value={settings?.section_spacing ?? 'normal'}
                            onChange={(e) => setSettings({...(settings ?? {}), section_spacing: e.target.value as 'compact' | 'normal' | 'spacious'})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="compact">Compact</option>
                            <option value="normal">Normal</option>
                            <option value="spacious">Spacious</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Border Radius</label>
                          <select
                            value={settings?.border_radius ?? 'medium'}
                            onChange={(e) => setSettings({...(settings ?? {}), border_radius: e.target.value as 'none' | 'small' | 'medium' | 'large'})}
                            className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="none">None (Square)</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Theme Preview */}
                    <div className="mt-6 p-4 border border-gray-200 rounded">
                      <h5 className={`font-medium ${themeClasses.textPrimary} mb-3`}>Theme Preview</h5>
                      <div 
                        className="p-4 rounded transition-all duration-200"
                        style={themePreviewStyle}
                      >
                        <h6 className="font-bold mb-2" style={{ color: sanitizeColor(settings?.primary_color || '#1e40af') }}>Sample Heading</h6>
                        <p className="mb-2">This is how your content will look with the selected theme settings.</p>
                        <button 
                          className="px-4 py-2 rounded text-white transition-colors"
                          style={{ 
                            backgroundColor: sanitizeColor(settings?.primary_color || '#1e40af'),
                            borderRadius: settings?.border_radius === 'none' ? '0' : settings?.border_radius === 'small' ? '4px' : settings?.border_radius === 'large' ? '12px' : '8px'
                          }}
                        >
                          Sample Button
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        onClick={handleSettingsUpdate}
                        disabled={savingSettings}
                        className={`${themeClasses.buttonPrimary} ${themeClasses.radius} px-4 py-2 flex items-center disabled:opacity-50`}
                      >
                        <Save className={`h-4 w-4 mr-2 ${savingSettings ? 'animate-spin' : ''}`} />
                        {savingSettings ? 'Saving...' : 'Save Theme Settings'}
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'security' && (
                  <div>
                    <h4 className={`text-lg font-bold ${themeClasses.textPrimary} mb-4`}>Change Password</h4>
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>Confirm Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button 
                        onClick={handlePasswordChange}
                        className={`${themeClasses.buttonPrimary} ${themeClasses.radius} px-4 py-2`}
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