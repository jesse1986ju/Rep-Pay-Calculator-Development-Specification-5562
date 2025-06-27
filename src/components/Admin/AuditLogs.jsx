import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'

const { FiActivity, FiFilter, FiCalendar, FiUser } = FiIcons

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    action: '',
    dateRange: '7d'
  })

  useEffect(() => {
    loadAuditLogs()
  }, [filter])

  const loadAuditLogs = async () => {
    try {
      // This is a mock implementation since we haven't created the audit_logs table
      // In a real implementation, you would query the audit_logs table
      const mockLogs = [
        {
          id: 1,
          user_name: 'Admin User',
          action: 'Updated multiplier',
          details: 'Changed grade A multiplier from 1.2 to 1.25',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          table_name: 'multipliers'
        },
        {
          id: 2,
          user_name: 'Manager Smith',
          action: 'Added base package',
          details: 'Created new package "Premium Security"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          table_name: 'base_packages'
        },
        {
          id: 3,
          user_name: 'Admin User',
          action: 'Updated settings',
          details: 'Changed revenue deduction from 10% to 12%',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          table_name: 'settings'
        },
        {
          id: 4,
          user_name: 'Manager Johnson',
          action: 'Deleted equipment addon',
          details: 'Removed "Old Camera Model" from available addons',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          table_name: 'equipment_addons'
        },
        {
          id: 5,
          user_name: 'Admin User',
          action: 'Created user',
          details: 'Added new rep "John Doe" to the system',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          table_name: 'users'
        }
      ]

      setLogs(mockLogs)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action) => {
    if (action.toLowerCase().includes('delete')) return 'danger'
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('add')) return 'success'
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('change')) return 'warning'
    return 'primary'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={filter.action}
            onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-200">
          {logs.map((log) => {
            const actionColor = getActionColor(log.action)
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${actionColor}-100 text-${actionColor}-800`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <SafeIcon icon={FiUser} className="h-3 w-3 mr-1" />
                        {log.user_name}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <SafeIcon icon={FiCalendar} className="h-3 w-3 mr-1" />
                        {format(log.timestamp, 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{log.details}</p>
                    <p className="text-sm text-gray-500">Table: {log.table_name}</p>
                  </div>
                  <SafeIcon icon={FiActivity} className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiActivity} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-gray-500">No activity logs match your current filters.</p>
        </div>
      )}
    </div>
  )
}

export default AuditLogs