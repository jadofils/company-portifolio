'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTheme } from '@/hooks/useTheme'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { getThemeClasses } = useTheme()
  const themeClasses = getThemeClasses

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Password reset requested for:', email)
    setIsSubmitted(true)
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <Navbar />
      
      <section className={`${themeClasses.spacing} mt-16`}>
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className={`section-title ${themeClasses.textPrimary}`}>
              Reset Password
            </h2>
            <p className={`section-subtitle ${themeClasses.textSecondary}`}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className={`${themeClasses.card} ${themeClasses.radius} p-8`}>
              {!isSubmitted ? (
                <>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.formLabel} mb-2`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-3 py-2 ${themeClasses.input} ${themeClasses.radius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="admin@mineralsco.com"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full ${themeClasses.buttonPrimary} ${themeClasses.radius} px-4 py-2`}
                    >
                      Send Reset Link
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-2`}>Check Your Email</h3>
                  <p className={`${themeClasses.textSecondary} mb-6`}>
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link href="/login" className={`${themeClasses.textSecondary} hover:opacity-80`}>
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}