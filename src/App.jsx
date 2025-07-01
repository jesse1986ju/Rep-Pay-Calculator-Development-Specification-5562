import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthForm from './components/Auth/AuthForm'
import Header from './components/Layout/Header'
import PublicHeader from './components/Layout/PublicHeader'
import PayCalculator from './components/Calculator/PayCalculator'
import AdminDashboard from './components/Admin/AdminDashboard'
import './App.css'

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()

  console.log('AdminRoute check:', { user: !!user, profile: profile?.role, loading })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading admin access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('No user, redirecting to login')
    return <Navigate to="/admin/login" replace />
  }

  if (!profile) {
    console.log('No profile, redirecting to login')
    return <Navigate to="/admin/login" replace />
  }

  if (profile.role !== 'admin') {
    console.log('Not admin role:', profile.role)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Admin privileges required</p>
          <p className="text-sm text-gray-500">Current role: {profile.role}</p>
          <a href="#/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Calculator
          </a>
        </div>
      </div>
    )
  }

  console.log('Admin access granted')
  return children
}

// Public routes that don't need auth context
const PublicRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <>
            <PublicHeader />
            <main className="py-8 px-4 sm:px-6 lg:px-8">
              <PayCalculator isPublic={true} />
            </main>
          </>
        } 
      />
      <Route 
        path="/admin/login" 
        element={
          <AuthProvider>
            <AuthForm adminOnly={true} />
          </AuthProvider>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AuthProvider>
            <AdminRoute>
              <Header />
              <main className="py-8 px-4 sm:px-6 lg:px-8">
                <AdminDashboard />
              </main>
            </AdminRoute>
          </AuthProvider>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <PublicRoutes />
      </div>
    </Router>
  )
}

export default App