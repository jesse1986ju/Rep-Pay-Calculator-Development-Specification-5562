import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'
import PayResult from './PayResult'

const { FiDollarSign, FiTrendingUp, FiPackage, FiPlus, FiMinus, FiRefreshCw, FiShield, FiStar, FiLock, FiUnlock, FiInfo, FiAlertTriangle } = FiIcons

const PayCalculator = ({ isPublic = false }) => {
  const [formData, setFormData] = useState({
    basePackage: '',
    mmr: '',
    customMMR: false,
    qualification: 'A',
    billingType: 'ACH',
    contractTerm: '60',
    platinumProtection: false,
    addons: []
  })

  const [multipliers, setMultipliers] = useState({})
  const [basePackages, setBasePackages] = useState([])
  const [equipmentAddons, setEquipmentAddons] = useState([])
  const [billingTypes, setBillingTypes] = useState([
    { id: 'ach', name: 'ACH', bonus_multiplier: 2 },
    { id: 'cc', name: 'Credit Card', bonus_multiplier: 0 },
    { id: 'manual', name: 'Manual Billing', bonus_multiplier: 0 }
  ])
  const [contractTerms, setContractTerms] = useState([
    { id: '60', months: 60, bonus_multiplier: 2 },
    { id: '36', months: 36, bonus_multiplier: 0 }
  ])
  const [settings, setSettings] = useState({
    deduct_percent: 10,
    c_grade_install_fee: 199.00,
    ach_bonus: 2,
    contract_60_bonus: 2,
    platinum_bonus: 2
  })

  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState(null)

  const qualificationOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C']

  // Check if C grade is selected (platinum not allowed)
  const isCGrade = formData.qualification === 'C'

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Auto-calculate when form data changes
    if (formData.basePackage && formData.mmr) {
      calculatePay()
    }
  }, [formData, multipliers, settings])

  // Reset platinum protection when C grade is selected
  useEffect(() => {
    if (isCGrade && formData.platinumProtection) {
      setFormData(prev => ({
        ...prev,
        platinumProtection: false
      }))
    }
  }, [isCGrade, formData.platinumProtection])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load multipliers (hidden from user but used in calculations)
      const { data: multipliersData, error: multipliersError } = await supabase
        .from('multipliers_rpc_x7k9m2')
        .select('*')

      if (multipliersError) {
        console.error('Error loading multipliers:', multipliersError)
      } else if (multipliersData) {
        const multiplierMap = {}
        multipliersData.forEach(m => {
          multiplierMap[m.grade] = m.value
        })
        setMultipliers(multiplierMap)
      }

      // Load base packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('base_packages_rpc_x7k9m2')
        .select('*')

      if (packagesError) {
        console.error('Error loading packages:', packagesError)
        // Set fallback data
        setBasePackages([
          {
            id: 'interactive',
            name: 'Interactive',
            mmr_value: 54.99,
            passthrough_deduction: 4.00,
            equipment_cost: 199.99,
            install_fee: 99.00,
            activation_fee: 49.99
          },
          {
            id: 'doorbell',
            name: 'Doorbell',
            mmr_value: 64.99,
            passthrough_deduction: 6.50,
            equipment_cost: 299.99,
            install_fee: 129.00,
            activation_fee: 49.99
          },
          {
            id: 'outdoor',
            name: 'Outdoor',
            mmr_value: 69.99,
            passthrough_deduction: 8.50,
            equipment_cost: 399.99,
            install_fee: 159.00,
            activation_fee: 49.99
          }
        ])
      } else {
        setBasePackages(packagesData || [])
      }

      // Load equipment addons
      const { data: addonsData, error: addonsError } = await supabase
        .from('equipment_addons_rpc_x7k9m2')
        .select('*')

      if (addonsError) {
        console.error('Error loading addons:', addonsError)
        // Set fallback data
        setEquipmentAddons([
          { id: 'sensor', name: 'Door/Window Sensor', cost: 29.99, description: 'Additional door or window sensor' },
          { id: 'motion', name: 'Motion Detector', cost: 39.99, description: 'Indoor motion detection sensor' },
          { id: 'glass', name: 'Glass Break Detector', cost: 49.99, description: 'Detects glass breaking sounds' },
          { id: 'smoke', name: 'Smoke Detector', cost: 59.99, description: 'Wireless smoke detection' },
          { id: 'camera-indoor', name: 'Indoor Camera', cost: 129.99, description: 'Additional indoor security camera' },
          { id: 'camera-outdoor', name: 'Outdoor Camera', cost: 179.99, description: 'Weather-resistant outdoor camera' }
        ])
      } else {
        setEquipmentAddons(addonsData || [])
      }

      // Load billing types
      const { data: billingData, error: billingError } = await supabase
        .from('billing_types_rpc_x7k9m2')
        .select('*')
        .eq('is_active', true)

      if (!billingError && billingData) {
        setBillingTypes(billingData)
      }

      // Load contract terms
      const { data: contractData, error: contractError } = await supabase
        .from('contract_terms_rpc_x7k9m2')
        .select('*')
        .eq('is_active', true)

      if (!contractError && contractData) {
        setContractTerms(contractData)
      }

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings_rpc_x7k9m2')
        .select('*')
        .single()

      if (!settingsError && settingsData) {
        setSettings(settingsData)
      }
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

  const handlePackageChange = (packageId) => {
    const selectedPackage = basePackages.find(pkg => pkg.id === packageId)
    if (selectedPackage && !formData.customMMR) {
      // Auto-fill MMR based on package selection
      setFormData(prev => ({
        ...prev,
        basePackage: packageId,
        mmr: selectedPackage.mmr_value?.toString() || '0'
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        basePackage: packageId
      }))
    }
  }

  const toggleCustomMMR = () => {
    const newCustomMMR = !formData.customMMR
    setFormData(prev => {
      const newData = { ...prev, customMMR: newCustomMMR }
      
      // If switching back to auto MMR, reset to package value
      if (!newCustomMMR && prev.basePackage) {
        const selectedPackage = basePackages.find(pkg => pkg.id === prev.basePackage)
        if (selectedPackage) {
          newData.mmr = selectedPackage.mmr_value?.toString() || '0'
        }
      }
      
      return newData
    })
  }

  const handleAddonChange = (addonId, field, value) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.map(addon =>
        addon.id === addonId ? { ...addon, [field]: value } : addon
      ).filter(addon => addon.quantity > 0 || field === 'quantity')
    }))
  }

  const addAddon = (addon) => {
    const existingAddon = formData.addons.find(a => a.id === addon.id)
    if (existingAddon) {
      handleAddonChange(addon.id, 'quantity', existingAddon.quantity + 1)
    } else {
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, { ...addon, quantity: 1, chargingCustomer: true }]
      }))
    }
  }

  const calculatePay = async () => {
    if (!formData.mmr || !formData.basePackage) {
      setResult(null)
      return
    }

    setCalculating(true)

    try {
      const selectedPackage = basePackages.find(pkg => pkg.id === formData.basePackage)
      if (!selectedPackage) return

      // Step 1: MMR auto-fills based on package (already done in form)
      const mmr = parseFloat(formData.mmr)

      // Step 2: Apply passthrough deduction
      const passthroughDeduction = selectedPackage.passthrough_deduction || 0
      const netMMR = mmr - passthroughDeduction

      // Step 3: Calculate Total Multiplier (HIDDEN FROM USER)
      const baseMultiplier = multipliers[formData.qualification] || 17

      // Add bonuses
      let totalMultiplier = baseMultiplier

      // ACH bonus
      const selectedBilling = billingTypes.find(b => b.name === formData.billingType)
      if (selectedBilling) {
        totalMultiplier += selectedBilling.bonus_multiplier || 0
      }

      // Contract term bonus
      const selectedTerm = contractTerms.find(t => t.months.toString() === formData.contractTerm)
      if (selectedTerm) {
        totalMultiplier += selectedTerm.bonus_multiplier || 0
      }

      // Platinum protection bonus - NOT ALLOWED for C grade
      if (formData.platinumProtection && !isCGrade) {
        totalMultiplier += settings.platinum_bonus || 2
      }

      // Step 4: Revenue = Net MMR × Total Multiplier
      const revenue = netMMR * totalMultiplier

      // Step 5: Apply 10% revenue deduction
      const revenueDeductionPercent = settings.deduct_percent || 10
      const revenueDeduction = revenue * (revenueDeductionPercent / 100)
      const netRevenue = revenue - revenueDeduction

      // Step 6: Subtract Base Package Costs
      const packageCosts = {
        equipment: selectedPackage.equipment_cost || 0,
        install: selectedPackage.install_fee || 0,
        activation: selectedPackage.activation_fee || 0
      }

      // C Grade install fee override
      let cGradeInstallFee = 0
      if (formData.qualification === 'C') {
        cGradeInstallFee = settings.c_grade_install_fee || 199.00
      }

      // Step 7: Handle Add-on Equipment
      let unchargedAddonCosts = 0
      formData.addons.forEach(addon => {
        if (!addon.chargingCustomer) {
          unchargedAddonCosts += (parseFloat(addon.cost) || 0) * (addon.quantity || 0)
        }
      })

      // Final Rep Pay Calculation
      const totalPackageCosts = packageCosts.equipment + packageCosts.install + packageCosts.activation
      const finalRepPay = netRevenue - totalPackageCosts - cGradeInstallFee - unchargedAddonCosts

      const calculationResult = {
        finalRepPay: Number(finalRepPay.toFixed(2)),
        isProfitable: finalRepPay > 0,
        breakdown: {
          mmr: Number(mmr.toFixed(2)),
          passthroughDeduction: Number(passthroughDeduction.toFixed(2)),
          netMMR: Number(netMMR.toFixed(2)),
          baseMultiplier: baseMultiplier, // Hidden from user
          totalMultiplier: totalMultiplier, // Hidden from user
          revenue: Number(revenue.toFixed(2)),
          revenueDeduction: Number(revenueDeduction.toFixed(2)),
          netRevenue: Number(netRevenue.toFixed(2)),
          packageCosts: {
            equipment: Number(packageCosts.equipment.toFixed(2)),
            install: Number(packageCosts.install.toFixed(2)),
            activation: Number(packageCosts.activation.toFixed(2)),
            total: Number(totalPackageCosts.toFixed(2))
          },
          cGradeInstallFee: Number(cGradeInstallFee.toFixed(2)),
          unchargedAddonCosts: Number(unchargedAddonCosts.toFixed(2)),
          multiplierBreakdown: {
            base: baseMultiplier,
            billing: selectedBilling?.bonus_multiplier || 0,
            contract: selectedTerm?.bonus_multiplier || 0,
            platinum: (formData.platinumProtection && !isCGrade) ? (settings.platinum_bonus || 2) : 0
          }
        }
      }

      setResult(calculationResult)
    } catch (error) {
      console.error('Error calculating pay:', error)
    } finally {
      setCalculating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      basePackage: '',
      mmr: '',
      customMMR: false,
      qualification: 'A',
      billingType: 'ACH',
      contractTerm: '60',
      platinumProtection: false,
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <SafeIcon icon={FiDollarSign} className="mr-3 h-6 w-6 text-primary-600" />
            Engage Rep Pay Calculator
          </h2>
          {isPublic && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              <SafeIcon icon={FiInfo} className="h-4 w-4" />
              <span>Public Access - No Login Required</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Selection */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiPackage} className="inline h-4 w-4 mr-1" />
              Package Type
              <span className="text-xs text-primary-600 ml-2 bg-primary-50 px-2 py-1 rounded-full">
                Auto-fills MMR
              </span>
            </label>
            <select
              value={formData.basePackage}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Select a package</option>
              {basePackages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - ${pkg.mmr_value} MMR
                </option>
              ))}
            </select>
          </div>

          {/* MMR Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Monitoring Rate (MMR)
              <button
                type="button"
                onClick={toggleCustomMMR}
                className="ml-2 text-xs text-primary-600 hover:text-primary-700 inline-flex items-center bg-primary-50 px-2 py-1 rounded-full transition-colors"
              >
                <SafeIcon icon={formData.customMMR ? FiUnlock : FiLock} className="h-3 w-3 mr-1" />
                {formData.customMMR ? 'Custom' : 'Auto'}
              </button>
            </label>
            <div className="relative">
              <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData.mmr}
                onChange={(e) => handleInputChange('mmr', e.target.value)}
                disabled={!formData.customMMR}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  !formData.customMMR ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Select package to auto-fill MMR"
              />
              {!formData.customMMR && (
                <SafeIcon icon={FiLock} className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
            </div>
            {formData.basePackage && !formData.customMMR && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <SafeIcon icon={FiInfo} className="h-3 w-3 mr-1" />
                Auto-filled based on {basePackages.find(p => p.id === formData.basePackage)?.name} package
              </p>
            )}
          </div>

          {/* Customer Qualification Grade - NO MULTIPLIER SHOWN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Qualification Grade
            </label>
            <select
              value={formData.qualification}
              onChange={(e) => handleInputChange('qualification', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              {qualificationOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isCGrade && (
              <p className="text-xs text-warning-600 mt-1 flex items-center">
                <SafeIcon icon={FiAlertTriangle} className="h-3 w-3 mr-1" />
                C Grade customers cannot have Platinum Added
              </p>
            )}
          </div>

          {/* Billing Type - HIDE BONUS VALUES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Type
            </label>
            <div className="space-y-2">
              {billingTypes.map(type => (
                <label key={type.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value={type.name}
                    checked={formData.billingType === type.name}
                    onChange={(e) => handleInputChange('billingType', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-900 flex-1">
                    {type.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Contract Term - HIDE BONUS VALUES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Term
            </label>
            <div className="space-y-2">
              {contractTerms.map(term => (
                <label key={term.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value={term.months.toString()}
                    checked={formData.contractTerm === term.months.toString()}
                    onChange={(e) => handleInputChange('contractTerm', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-900 flex-1">
                    {term.months} months
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Platinum Added - HIDE BONUS VALUES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiShield} className="inline h-4 w-4 mr-1" />
              Platinum Added
              {isCGrade && (
                <span className="text-xs text-warning-600 ml-2 bg-warning-50 px-2 py-1 rounded-full">
                  Not Available for C Grade
                </span>
              )}
            </label>
            <div className="space-y-2">
              <label className={`flex items-center p-3 border border-gray-200 rounded-lg transition-colors ${
                isCGrade ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'
              }`}>
                <input
                  type="radio"
                  value="yes"
                  checked={formData.platinumProtection === true}
                  onChange={() => !isCGrade && handleInputChange('platinumProtection', true)}
                  disabled={isCGrade}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 disabled:opacity-50"
                />
                <span className="ml-3 text-sm text-gray-900 flex-1">
                  Yes
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  value="no"
                  checked={formData.platinumProtection === false}
                  onChange={() => handleInputChange('platinumProtection', false)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-900">No</span>
              </label>
            </div>
            {isCGrade && (
              <p className="text-xs text-warning-600 mt-2 flex items-center">
                <SafeIcon icon={FiAlertTriangle} className="h-3 w-3 mr-1" />
                C Grade qualification automatically sets Platinum Added to "No"
              </p>
            )}
          </div>

          {/* Equipment Add-ons */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Equipment Add-ons
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipmentAddons.map(addon => {
                const existingAddon = formData.addons.find(a => a.id === addon.id)
                const quantity = existingAddon?.quantity || 0
                const chargingCustomer = existingAddon?.chargingCustomer ?? true

                return (
                  <div key={addon.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{addon.name}</h4>
                        <p className="text-sm text-gray-600">${addon.cost}</p>
                        {addon.description && (
                          <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddonChange(addon.id, 'quantity', Math.max(0, quantity - 1))}
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
                    {quantity > 0 && (
                      <div className="space-y-2">
                        <label className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <input
                            type="radio"
                            checked={chargingCustomer === true}
                            onChange={() => handleAddonChange(addon.id, 'chargingCustomer', true)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-900">Charging Customer - Yes</span>
                        </label>
                        <label className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <input
                            type="radio"
                            checked={chargingCustomer === false}
                            onChange={() => handleAddonChange(addon.id, 'chargingCustomer', false)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            Charging Customer - No
                            <span className="text-danger-600 font-medium ml-2">
                              (-${(addon.cost * quantity).toFixed(2)})
                            </span>
                          </span>
                        </label>
                      </div>
                    )}
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

        {/* Live Profitability Indicator */}
        {result && (
          <div className="mt-6 text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              result.isProfitable ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
            }`}>
              <SafeIcon icon={FiTrendingUp} className="h-4 w-4 mr-2" />
              {result.isProfitable ? 'Profitable Deal' : 'Unprofitable Deal'} - ${Math.abs(result.finalRepPay).toFixed(2)}
            </div>
          </div>
        )}
      </motion.div>

      {/* Results */}
      {result && <PayResult result={result} formData={formData} isPublic={isPublic} />}
    </div>
  )
}

export default PayCalculator