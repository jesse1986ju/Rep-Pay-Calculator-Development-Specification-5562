import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiCalculator, FiSettings } = FiIcons

const PublicHeader = () => {
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
              <p className="text-sm text-gray-500">Engage Home Security</p>
            </div>
          </div>

          <div className="flex items-center">
            <Link
              to="/admin/login"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiSettings} className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default PublicHeader