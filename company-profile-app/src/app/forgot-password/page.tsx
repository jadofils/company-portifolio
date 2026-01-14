'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Password reset requested for:', email)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-20 bg-white mt-16">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Reset Password
            </h2>
            <p className="section-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded p-8">
              {!isSubmitted ? (
                <>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        placeholder="admin@mineralsco.com"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-primary"
                    >
                      Send Reset Link
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
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