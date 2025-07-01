import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useAuth } from '../../contexts/AuthContext'

const { FiMail, FiLock, FiEye, FiEyeOff, FiCalculator, FiArrowLeft, FiAlertCircle } = FiIcons

const AuthForm = ({ adminOnly = false }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth form effect:', { user: !!user, profile, authLoading })
    if (!authLoading && user && profile) {
      console.log('User authenticated with profile:', profile.role)
      if (adminOnly && profile.role === 'admin') {
        console.log('Redirecting to admin dashboard...')
        navigate('/admin', { replace: true })
      } else if (!adminOnly) {
        navigate('/', { replace: true })
      }
    }
  }, [user, profile, authLoading, adminOnly, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting sign in...')
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error('Sign in error details:', error)
        // Provide specific error messages
        let errorMessage = 'Login failed. Please try again.'
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed. Please check your email or contact admin.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes and try again.'
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Admin user not found. Please contact system administrator.'
        }
        
        throw new Error(errorMessage)
      }

      console.log('Sign in successful, waiting for profile...')
      // The auth context will handle the profile loading and navigation
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  const goBack = () => {
    window.location.href = '#/'
  }

  // Show loading if auth is loading or we're processing sign in
  const isLoading = authLoading || loading

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="bg-primary-600 p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <SafeIcon icon={FiCalculator} className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {adminOnly ? 'Admin Login' : 'Rep Pay Calculator'}
          </h2>
          <p className="text-gray-600 mt-2">
            {adminOnly ? 'Access admin dashboard' : 'Engage Home Security'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="h-5 w-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-start">
              <SafeIcon icon={FiAlertCircle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Login Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {loading ? 'Signing in...' : 'Loading profile...'}
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {adminOnly && (
          <div className="mt-6 text-center">
            <button
              onClick={goBack}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
              Back to Calculator
            </button>
          </div>
        )}

        {/* Admin Setup Instructions - Only show in development */}
        {adminOnly && process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
              <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-2" />
              Development Mode - Admin Setup
            </h3>
            <div className="text-xs text-yellow-700 space-y-2">
              <p><strong>If login fails:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to Supabase Dashboard → Authentication → Users</li>
                <li>Click "Add User" with your admin email</li>
                <li>Set a secure password</li>
                <li>Uncheck email confirmation</li>
                <li>Check the setup instructions in the project files</li>
              </ol>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AuthForm