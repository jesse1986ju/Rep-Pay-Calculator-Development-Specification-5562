import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'

const { FiSettings, FiSave, FiPercent, FiDollarSign } = FiIcons

const SettingsManager = () => {
  const [settings, setSettings] = useState({
    deduct_percent: 10,
    platinum_bonus: 50,
    term_adjustment_36mo: 99
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('id')
        .single()

      if (existingSettings) {
        const { error } = await supabase
          .from('settings')
          .update(settings)
          .eq('id', existingSettings.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([settings])

        if (error) throw error
      }

      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
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
        <h3 className="text-lg font-semibold text-gray-900">Global Settings</h3>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {/* Revenue Deduction Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Revenue Deduction Percentage
          </label>
          <div className="relative">
            <SafeIcon icon={FiPercent} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={settings.deduct_percent}
              onChange={(e) => handleInputChange('deduct_percent', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Percentage of gross revenue to deduct from rep pay
          </p>
        </div>

        {/* Platinum Protection Bonus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platinum Protection Bonus
          </label>
          <div className="relative">
            <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.platinum_bonus}
              onChange={(e) => handleInputChange('platinum_bonus', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Bonus amount added when platinum protection is selected
          </p>
        </div>

        {/* 36-Month Term Adjustment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            36-Month Contract Adjustment
          </label>
          <div className="relative">
            <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.term_adjustment_36mo}
              onChange={(e) => handleInputChange('term_adjustment_36mo', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Amount to deduct when 36-month contract is selected
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <SafeIcon icon={FiSave} className="mr-2 h-5 w-5" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Settings Preview */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Current Settings Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{settings.deduct_percent}%</div>
              <div className="text-sm text-gray-600">Revenue Deduction</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">${settings.platinum_bonus}</div>
              <div className="text-sm text-gray-600">Platinum Bonus</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">${settings.term_adjustment_36mo}</div>
              <div className="text-sm text-gray-600">36-Month Adjustment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsManager