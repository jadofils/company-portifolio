'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Publication {
  id: number
  title: string
  description: string | null
  content: string | null
  pdf_path: string | null
  published_date: string
  created_at: string
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('/api/publications')
        const data = await response.json()
        setPublications(data.publications || [])
      } catch (error) {
        console.error('Failed to fetch publications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="container-max section-padding">
            <div className="text-center">
              <p>Loading publications...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container-max section-padding">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Publications</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our latest research, reports, and industry insights in mineral processing and sustainable mining practices.
            </p>
          </div>

          {publications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Publications Available</h3>
              <p className="text-gray-600">Check back soon for our latest publications and research.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((publication) => (
                <div key={publication.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{publication.title}</h3>
                      {publication.description && (
                        <p className="text-gray-600 mb-4">{publication.description}</p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {publication.pdf_path ? (
                        <FileText className="h-8 w-8 text-red-600" />
                      ) : (
                        <FileText className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                  </div>

                  {publication.content && (
                    <div className="mb-4">
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {publication.content.length > 200 
                          ? `${publication.content.substring(0, 200)}...` 
                          : publication.content
                        }
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(publication.published_date).toLocaleDateString()}
                    </div>
                    
                    {publication.pdf_path ? (
                      <a
                        href={publication.pdf_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        <FileText className="h-4 w-4 mr-1" />
                        Article
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}