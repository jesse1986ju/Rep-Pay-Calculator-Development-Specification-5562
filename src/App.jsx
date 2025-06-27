import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthForm from './components/Auth/AuthForm'
import Header from './components/Layout/Header'
import PayCalculator from './components/Calculator/PayCalculator'
import AdminDashboard from './components/Admin/AdminDashboard'
import './App.css'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

const AppContent = () => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PayCalculator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App