import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import MultipliersManager from './MultipliersManager'
import PackagesManager from './PackagesManager'
import SettingsManager from './SettingsManager'
import AuditLogs from './AuditLogs'

const { FiSettings, FiPackage, FiTrendingUp, FiActivity, FiUsers } = FiIcons

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('multipliers')

  const tabs = [
    { id: 'multipliers', label: 'Multipliers', icon: FiTrendingUp },
    { id: 'packages', label: 'Packages', icon: FiPackage },
    { id: 'settings', label: 'Settings', icon: FiSettings },
    { id: 'audit', label: 'Audit Logs', icon: FiActivity },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'multipliers':
        return <MultipliersManager />
      case 'packages':
        return <PackagesManager />
      case 'settings':
        return <SettingsManager />
      case 'audit':
        return <AuditLogs />
      default:
        return <MultipliersManager />
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <SafeIcon icon={FiUsers} className="mr-3 h-6 w-6 text-primary-600" />
            Admin Dashboard
          </h2>
          <p className="text-gray-600 mt-2">Manage system settings, multipliers, and packages</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={tab.icon} className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard