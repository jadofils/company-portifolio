'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTheme } from '@/hooks/useTheme'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const { getThemeClasses } = useTheme()
  const themeClasses = getThemeClasses

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    if (!formData.email.trim()) {
      setErrors({email: 'Email is required'})
      setIsLoading(false)
      return
    }
    if (!formData.password.trim()) {
      setErrors({password: 'Password is required'})
      setIsLoading(false)
      return
    }

    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/admin'
      } else {
        setErrors({general: data.error || 'Login failed'})
        setIsLoading(false)
      }
    })
    .catch(error => {
      console.error('Login error:', error)
      setErrors({general: 'Login failed'})
      setIsLoading(false)
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <Navbar />
      
      <section className={`${themeClasses.spacing} mt-16`}>
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className={`section-title ${themeClasses.textPrimary}`}>
              Admin Login
            </h2>
            <p className={`section-subtitle ${themeClasses.textSecondary}`}>
              Sign in to access the portfolio management system.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className={`${themeClasses.card} ${themeClasses.radius} p-8`}>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="admin@mineralsco.com"
                    autoComplete="off"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-gray-600 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className={`ml-2 block text-sm ${themeClasses.textSecondary}`}>
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className={`${themeClasses.textSecondary} hover:text-blue-600`}>
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${themeClasses.buttonPrimary} ${themeClasses.radius} px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
                {errors.general && (
                  <p className="text-red-500 text-sm text-center mt-2">{errors.general}</p>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Don't have an account?{' '}
                  <a href="/#contact" className={`${themeClasses.textSecondary} hover:text-blue-600`}>
                    Contact Administrator
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}