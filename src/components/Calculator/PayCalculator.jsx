import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import PayResult from './PayResult'

const { FiDollarSign, FiTrendingUp, FiPackage, FiPlus, FiMinus, FiRefreshCw } = FiIcons

const PayCalculator = () => {
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    mmr: '',
    qualification: 'A',
    contractTerm: '60',
    platinumProtection: false,
    basePackage: '',
    addons: []
  })

  const [multipliers, setMultipliers] = useState({})
  const [basePackages, setBasePackages] = useState([])
  const [equipmentAddons, setEquipmentAddons] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState(null)

  const qualificationOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C']

  useEffect(() => {
    loadData()
  }, [profile])

  const loadData = async () => {
    if (!profile) return

    try {
      setLoading(true)
      
      // Load multipliers
      const { data: multipliersData } = await supabase
        .from('multipliers')
        .select('*')
        .or(`rep_id.is.null,rep_id.eq.${profile.id}`)
        .or(`manager_id.is.null,manager_id.eq.${profile.manager_id}`)
        .or(`state.is.null,state.eq.${profile.state}`)

      const multiplierMap = {}
      multipliersData?.forEach(m => {
        multiplierMap[m.grade] = m.value
      })
      setMultipliers(multiplierMap)

      // Load base packages
      const { data: packagesData } = await supabase
        .from('base_packages')
        .select('*')
        .or(`rep_id.is.null,rep_id.eq.${profile.id}`)
        .or(`manager_id.is.null,manager_id.eq.${profile.manager_id}`)
        .or(`state.is.null,state.eq.${profile.state}`)

      setBasePackages(packagesData || [])

      // Load equipment addons
      const { data: addonsData } = await supabase
        .from('equipment_addons')
        .select('*')
        .or(`rep_id.is.null,rep_id.eq.${profile.id}`)
        .or(`manager_id.is.null,manager_id.eq.${profile.manager_id}`)
        .or(`state.is.null,state.eq.${profile.state}`)

      setEquipmentAddons(addonsData || [])

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single()

      setSettings(settingsData || {
        deduct_percent: 10,
        platinum_bonus: 50,
        term_adjustment_36mo: 99
      })

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddonChange = (addonId, quantity) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.map(addon =>
        addon.id === addonId ? { ...addon, quantity } : addon
      ).filter(addon => addon.quantity > 0)
    }))
  }

  const addAddon = (addon) => {
    const existingAddon = formData.addons.find(a => a.id === addon.id)
    if (existingAddon) {
      handleAddonChange(addon.id, existingAddon.quantity + 1)
    } else {
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, { ...addon, quantity: 1 }]
      }))
    }
  }

  const calculatePay = () => {
    if (!formData.mmr || !formData.basePackage) return

    setCalculating(true)
    
    setTimeout(() => {
      const mmr = parseFloat(formData.mmr)
      const multiplier = multipliers[formData.qualification] || 1
      const selectedPackage = basePackages.find(p => p.id === formData.basePackage)
      
      // Calculate gross revenue
      const grossRevenue = mmr * multiplier
      
      // Calculate deductions
      let totalDeductions = 0
      
      // Revenue deduction
      const revenueDeduction = grossRevenue * (settings.deduct_percent / 100)
      totalDeductions += revenueDeduction
      
      // Package costs
      if (selectedPackage) {
        totalDeductions += selectedPackage.equipment_cost + selectedPackage.install_fee + selectedPackage.activation_fee
      }
      
      // Contract term adjustment
      if (formData.contractTerm === '36') {
        totalDeductions += settings.term_adjustment_36mo
      }
      
      // Addon costs
      const addonCosts = formData.addons.reduce((sum, addon) => {
        return sum + (addon.cost * addon.quantity)
      }, 0)
      totalDeductions += addonCosts
      
      // Calculate final pay
      let finalPay = grossRevenue - totalDeductions
      
      // Add platinum bonus
      if (formData.platinumProtection) {
        finalPay += settings.platinum_bonus
      }
      
      setResult({
        grossRevenue,
        totalDeductions,
        finalPay,
        breakdown: {
          revenueDeduction,
          packageCosts: selectedPackage ? 
            selectedPackage.equipment_cost + selectedPackage.install_fee + selectedPackage.activation_fee : 0,
          termAdjustment: formData.contractTerm === '36' ? settings.term_adjustment_36mo : 0,
          addonCosts,
          platinumBonus: formData.platinumProtection ? settings.platinum_bonus : 0
        }
      })
      
      setCalculating(false)
    }, 500)
  }

  const resetForm = () => {
    setFormData({
      mmr: '',
      qualification: 'A',
      contractTerm: '60',
      platinumProtection: false,
      basePackage: '',
      addons: []
    })
    setResult(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <SafeIcon icon={FiDollarSign} className="mr-3 h-6 w-6 text-primary-600" />
          Pay Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MMR Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Monitoring Rate (MMR)
            </label>
            <div className="relative">
              <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData.mmr}
                onChange={(e) => handleInputChange('mmr', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Qualification Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Qualification Grade
            </label>
            <select
              value={formData.qualification}
              onChange={(e) => handleInputChange('qualification', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {qualificationOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Contract Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Term
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['60', '36'].map(term => (
                <button
                  key={term}
                  onClick={() => handleInputChange('contractTerm', term)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.contractTerm === term
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {term} months
                  {term === '36' && <span className="text-xs block text-gray-500">(-$99)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Platinum Protection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platinum Protection
            </label>
            <button
              onClick={() => handleInputChange('platinumProtection', !formData.platinumProtection)}
              className={`w-full p-3 rounded-lg border-2 transition-colors ${
                formData.platinumProtection
                  ? 'border-success-500 bg-success-50 text-success-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {formData.platinumProtection ? 'Yes (+$50)' : 'No'}
            </button>
          </div>

          {/* Base Package */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Package
            </label>
            <select
              value={formData.basePackage}
              onChange={(e) => handleInputChange('basePackage', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a package</option>
              {basePackages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - Equipment: ${pkg.equipment_cost}, Install: ${pkg.install_fee}, Activation: ${pkg.activation_fee}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Add-ons */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Add-ons
            </label>
            <div className="space-y-3">
              {equipmentAddons.map(addon => {
                const existingAddon = formData.addons.find(a => a.id === addon.id)
                const quantity = existingAddon?.quantity || 0
                
                return (
                  <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{addon.name}</h4>
                      <p className="text-sm text-gray-500">${addon.cost} each</p>
                      {addon.description && (
                        <p className="text-xs text-gray-400 mt-1">{addon.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddonChange(addon.id, Math.max(0, quantity - 1))}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={quantity === 0}
                      >
                        <SafeIcon icon={FiMinus} className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => addAddon(addon)}
                        className="p-1 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-600 transition-colors"
                      >
                        <SafeIcon icon={FiPlus} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={calculatePay}
            disabled={!formData.mmr || !formData.basePackage || calculating}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {calculating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <SafeIcon icon={FiTrendingUp} className="mr-2 h-5 w-5" />
            )}
            {calculating ? 'Calculating...' : 'Calculate Pay'}
          </button>
          
          <button
            onClick={resetForm}
            className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <SafeIcon icon={FiRefreshCw} className="mr-2 h-5 w-5" />
            Reset
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {result && <PayResult result={result} formData={formData} />}
    </div>
  )
}

export default PayCalculator