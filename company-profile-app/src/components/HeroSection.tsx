'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, Mountain } from 'lucide-react'
import { useImages } from '@/hooks/useImages'

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0)
  const { imageUrls, hasUploadedImages, loading } = useImages('hero')
  
  useEffect(() => {
    console.log('Hero images:', imageUrls, 'Has uploaded:', hasUploadedImages)
  }, [imageUrls, hasUploadedImages])
  
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % imageUrls.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
  }

  if (loading) {
    return (
      <section id="home" className="py-20 bg-white mt-16">
        <div className="container-max section-padding">
          <div className="text-center">
            <p>Loading images...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="home" className="py-20 bg-white mt-16">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-10 gap-8 items-center">
          {/* Image Gallery - 70% */}
          <div className="lg:col-span-7 relative">
            <div className="aspect-[16/10] overflow-hidden rounded relative bg-gray-100 flex items-center justify-center">
              {imageUrls.length > 0 ? (
                <>
                  <img 
                    src={imageUrls[currentImage]}
                    alt="Mining Operations"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 hidden flex items-center justify-center">
                    <Mountain className="h-24 w-24 text-gray-400" />
                  </div>
                </>
              ) : (
                <Mountain className="h-24 w-24 text-gray-400" />
              )}
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            {/* Navigation Dots */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <button 
                onClick={prevImage}
                className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <button 
                onClick={nextImage}
                className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImage ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content - 30% */}
          <div className="lg:col-span-3">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Minerals Processing
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Due to close and persistent contact with artisanal miners and mining companies, 
              our company is able to ensure a constant and stable mineral supply.
            </p>
            
            <a href="#about" className="inline-flex items-center text-gray-600 hover:text-gray-900 border-b border-gray-300 hover:border-gray-600 transition-colors">
              Read more <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection