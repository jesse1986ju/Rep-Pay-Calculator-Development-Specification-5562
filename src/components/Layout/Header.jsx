import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useAuth } from '../../contexts/AuthContext'

const { FiUser, FiLogOut, FiSettings, FiCalculator } = FiIcons

const Header = () => {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <SafeIcon icon={FiCalculator} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rep Pay Calculator</h1>
              <p className="text-sm text-gray-500">Brinks Home Security</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-500" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{profile?.name}</p>
                <p className="text-gray-500 capitalize">{profile?.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {profile?.role === 'admin' && (
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <SafeIcon icon={FiSettings} className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiLogOut} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header