'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Eye, X } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

interface Product {
  id: string
  title: string
  description: string
  image: string
  price?: string
}

const ProductsSection = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' })
  const [products, setProducts] = useState<Product[]>([])
  const { getThemeClasses } = useTheme()
  const themeClasses = getThemeClasses
  
  // Static fallback products
  const staticProducts: Product[] = [
    {
      id: 'coltan',
      title: 'Coltan (Tantalite)',
      description: 'High-grade coltan ore essential for electronics manufacturing. Our coltan undergoes rigorous processing to meet international quality standards for capacitor production in mobile phones, computers, and automotive electronics.',
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=400&fit=crop'
    },
    {
      id: 'cassiterite',
      title: 'Cassiterite (Tin Ore)',
      description: 'Premium cassiterite ore, the primary source of tin. Processed using advanced separation techniques to achieve optimal tin content for soldering materials, bronze alloys, and food packaging applications.',
      image: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=600&h=400&fit=crop'
    },
    {
      id: 'tungsten',
      title: 'Tungsten (Wolfram)',
      description: 'High-grade tungsten concentrates with exceptional hardness and heat resistance. Essential for steel alloys, cutting tools, electronics, and aerospace components due to its highest melting point among all elements.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
    }
  ]

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Get products images from API first
        const imagesResponse = await fetch('/api/images?section=products')
        const imagesData = await imagesResponse.json()
        
        // Get products content from API
        const contentResponse = await fetch('/api/content')
        const contentData = await contentResponse.json()
        const productsContent = contentData.content?.filter((item: any) => item.section === 'products') || []
        
        // console.log('Products images from DB:', imagesData.images)
        // console.log('Products content from DB:', productsContent)
        // console.log('Static products:', staticProducts)
        
        // Combine static products with database products
        const allProducts: Product[] = []
        
        // Add static products first
        staticProducts.forEach((staticProduct, index) => {
          // Try multiple ways to find matching image for static products
          let matchingImage = imagesData.images?.find((img: any) => 
            img.subsection === staticProduct.id || // exact match: 'coltan', 'cassiterite', 'tungsten'
            img.subsection === staticProduct.title.toLowerCase() || // title match
            img.title === staticProduct.title // title in image title field
          )
          
          const matchingContent = productsContent?.find((content: any) => 
            content.subsection === staticProduct.id ||
            content.title === staticProduct.title
          )
          
          // Priority: 1) Database image, 2) Content image_url, 3) Static fallback
          const productImage = matchingImage?.file_path || matchingContent?.image_url || staticProduct.image
          
          // console.log(`Product ${staticProduct.title}: DB image=${matchingImage?.file_path}, Content image=${matchingContent?.image_url}, Final=${productImage}`)
          
          allProducts.push({
            id: staticProduct.id,
            title: matchingContent?.title || staticProduct.title,
            description: matchingContent?.content || staticProduct.description,
            image: productImage
          })
        })
        
        // Add database-only products (not in static list)
        productsContent?.forEach((content: any) => {
          if (!staticProducts.some(sp => sp.id === content.subsection)) {
            // Try multiple ways to find matching image
            let matchingImage = imagesData.images?.find((img: any) => 
              img.subsection === content.subsection ||
              img.subsection === content.title.toLowerCase().replace(/\s+/g, '-') ||
              img.title === content.title
            )
            
            // Use content image_url if available, otherwise matching image, otherwise static fallback
            const productImage = content.image_url || matchingImage?.file_path || staticProducts[0].image
            
            allProducts.push({
              id: content.subsection || `product-${content.id}`,
              title: content.title,
              description: content.content,
              image: productImage
            })
          }
        })
        
        setProducts(allProducts.length > 0 ? allProducts : staticProducts)
      } catch (error) {
        // console.error('Error loading products:', error)
        setProducts(staticProducts)
      }
    }
    
    loadProducts()
  }, [])

  // Listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = () => {
      const loadProducts = async () => {
        try {
          // Get products images from API first
          const imagesResponse = await fetch('/api/images?section=products')
          const imagesData = await imagesResponse.json()
          
          // Get products content from API
          const contentResponse = await fetch('/api/content')
          const contentData = await contentResponse.json()
          const productsContent = contentData.content?.filter((item: any) => item.section === 'products') || []
          
          // Combine static products with database products
          const allProducts: Product[] = []
          
          // Add static products first
          staticProducts.forEach((staticProduct, index) => {
            // Try multiple ways to find matching image for static products
            let matchingImage = imagesData.images?.find((img: any) => 
              img.subsection === staticProduct.id || // exact match: 'coltan', 'cassiterite', 'tungsten'
              img.subsection === staticProduct.title.toLowerCase() || // title match
              img.title === staticProduct.title // title in image title field
            )
            
            const matchingContent = productsContent?.find((content: any) => 
              content.subsection === staticProduct.id ||
              content.title === staticProduct.title
            )
            
            // Priority: 1) Database image, 2) Content image_url, 3) Static fallback
            const productImage = matchingImage?.file_path || matchingContent?.image_url || staticProduct.image
            
            // console.log(`Product ${staticProduct.title}: DB image=${matchingImage?.file_path}, Content image=${matchingContent?.image_url}, Final=${productImage}`)
            
            allProducts.push({
              id: staticProduct.id,
              title: matchingContent?.title || staticProduct.title,
              description: matchingContent?.content || staticProduct.description,
              image: productImage
            })
          })
          
          // Add database-only products (not in static list)
          productsContent?.forEach((content: any) => {
            if (!staticProducts.some(sp => sp.id === content.subsection)) {
              // Try multiple ways to find matching image
              let matchingImage = imagesData.images?.find((img: any) => 
                img.subsection === content.subsection ||
                img.subsection === content.title.toLowerCase().replace(/\s+/g, '-') ||
                img.title === content.title
              )
              
              // Use content image_url if available, otherwise matching image, otherwise static fallback
              const productImage = content.image_url || matchingImage?.file_path || staticProducts[0].image
              
              allProducts.push({
                id: content.subsection || `product-${content.id}`,
                title: content.title,
                description: content.content,
                image: productImage
              })
            }
          })
          
          setProducts(allProducts.length > 0 ? allProducts : staticProducts)
        } catch (error) {
          // console.error('Error loading products:', error)
          setProducts(staticProducts)
        }
      }
      
      loadProducts()
    }
    
    window.addEventListener('contentUpdated', handleContentUpdate)
    return () => window.removeEventListener('contentUpdated', handleContentUpdate)
  }, [])

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const handleBuyNow = (product: Product) => {
    setContactForm({
      ...contactForm,
      message: `I'm interested in purchasing ${product.title}. Please provide more information about pricing and availability.`
    })
    setShowContactForm(true)
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
        alert('Message sent successfully! We will contact you soon.')
        setShowContactForm(false)
        setContactForm({ name: '', email: '', company: '', message: '' })
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      alert('Error sending message. Please try again.')
    }
  }

  return (
    <section id="products" className={`${themeClasses.spacing} bg-gray-50`}>
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Premium quality minerals processed to international standards for various industrial applications
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="h-64 bg-gray-200 relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = staticProducts[0].image
                  }}
                />
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{product.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {truncateText(product.description)}
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${themeClasses.button} ${themeClasses.radius} transition-colors`}
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleBuyNow(product)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${themeClasses.buttonPrimary} ${themeClasses.radius} transition-colors`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.title}</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {selectedProduct.description}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedProduct(null)
                    handleBuyNow(selectedProduct)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 ${themeClasses.buttonPrimary} ${themeClasses.radius} transition-colors`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} ${themeClasses.radius} max-w-md w-full`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>Contact Us</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className={`${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-1`}>Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-1`}>Email *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-1`}>Company</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.formLabel} mb-1`}>Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className={`flex-1 px-4 py-2 ${themeClasses.button} ${themeClasses.radius} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 ${themeClasses.buttonPrimary} ${themeClasses.radius} transition-colors`}
                  >
                    Send Message
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

export default ProductsSection