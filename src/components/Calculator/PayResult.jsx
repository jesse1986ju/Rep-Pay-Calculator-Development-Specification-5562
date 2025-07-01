import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiDollarSign, FiTrendingUp, FiDownload, FiSave, FiStar, FiShield, FiPackage, FiMinus, FiPlus } = FiIcons

const PayResult = ({ result, formData, isPublic = false }) => {
  const { finalRepPay, isProfitable, breakdown } = result

  const exportToPDF = () => {
    console.log('Exporting to PDF...')
  }

  const saveCalculation = () => {
    if (isPublic) {
      const calculationData = {
        result,
        formData,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('lastCalculation', JSON.stringify(calculationData))
      alert('Calculation saved locally!')
    } else {
      console.log('Saving calculation to database...')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <SafeIcon icon={FiDollarSign} className="mr-3 h-6 w-6 text-primary-600" />
          Rep Pay Breakdown
        </h3>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isProfitable ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
        }`}>
          {isProfitable ? 'Profitable' : 'Loss'} Deal
        </div>
      </div>

      {/* Final Pay Card */}
      <div className={`${isProfitable ? 'bg-success-50' : 'bg-danger-50'} p-6 rounded-xl mb-8`}>
        <div className="text-center">
          <p className={`text-sm font-medium ${isProfitable ? 'text-success-600' : 'text-danger-600'} mb-2`}>
            Final Rep Pay
          </p>
          <p className={`text-4xl font-bold ${isProfitable ? 'text-success-900' : 'text-danger-900'}`}>
            ${Math.abs(finalRepPay).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Qualification: {formData.qualification}
          </p>
        </div>
      </div>

      {/* Simplified Calculation Steps - NO MULTIPLIERS SHOWN */}
      <div className="space-y-6">
        {/* Step 1: MMR and Passthrough */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Step 1: MMR & Passthrough Deduction</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base MMR</span>
              <span className="font-medium">${breakdown.mmr.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Passthrough Deduction</span>
              <span className="font-medium text-danger-600">-${breakdown.passthroughDeduction.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Net MMR</span>
                <span className="text-primary-600">${breakdown.netMMR.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Revenue Calculation - HIDE MULTIPLIER DETAILS */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Revenue Calculation</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Revenue</span>
              <span className="font-medium">${breakdown.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">10% Revenue Deduction</span>
              <span className="font-medium text-danger-600">-${breakdown.revenueDeduction.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Net Revenue</span>
                <span className="text-primary-600">${breakdown.netRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Deductions */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Package & Add-on Costs</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Equipment Cost</span>
              <span className="font-medium text-danger-600">-${breakdown.packageCosts.equipment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Install Fee</span>
              <span className="font-medium text-danger-600">-${breakdown.packageCosts.install.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Activation Fee</span>
              <span className="font-medium text-danger-600">-${breakdown.packageCosts.activation.toFixed(2)}</span>
            </div>
            {breakdown.cGradeInstallFee > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">C Grade Install Fee</span>
                <span className="font-medium text-danger-600">-${breakdown.cGradeInstallFee.toFixed(2)}</span>
              </div>
            )}
            {breakdown.unchargedAddonCosts > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Uncharged Add-on Costs</span>
                <span className="font-medium text-danger-600">-${breakdown.unchargedAddonCosts.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Deductions</span>
                <span className="text-danger-600">-${(breakdown.packageCosts.total + breakdown.cGradeInstallFee + breakdown.unchargedAddonCosts).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Calculation */}
        <div className="bg-primary-50 rounded-xl p-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Final Rep Pay</span>
            <span className={isProfitable ? 'text-success-600' : 'text-danger-600'}>
              ${finalRepPay.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Sale Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Sale Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Package:</span>
            <span className="ml-2 font-medium">{formData.basePackage}</span>
          </div>
          <div>
            <span className="text-gray-600">MMR:</span>
            <span className="ml-2 font-medium">${formData.mmr}</span>
          </div>
          <div>
            <span className="text-gray-600">Qualification:</span>
            <span className="ml-2 font-medium">{formData.qualification}</span>
          </div>
          <div>
            <span className="text-gray-600">Billing:</span>
            <span className="ml-2 font-medium">{formData.billingType}</span>
          </div>
          <div>
            <span className="text-gray-600">Contract:</span>
            <span className="ml-2 font-medium">{formData.contractTerm} months</span>
          </div>
          <div>
            <span className="text-gray-600">Platinum Added:</span>
            <span className="ml-2 font-medium">{formData.platinumProtection ? 'Yes' : 'No'}</span>
          </div>
          {formData.addons.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-gray-600">Add-ons:</span>
              <span className="ml-2 font-medium">
                {formData.addons.map(addon => `${addon.name} (${addon.quantity})`).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={saveCalculation}
          className="flex-1 bg-success-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-success-700 transition-colors flex items-center justify-center"
        >
          <SafeIcon icon={FiSave} className="mr-2 h-5 w-5" />
          {isPublic ? 'Save Locally' : 'Save Calculation'}
        </button>
        <button
          onClick={exportToPDF}
          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
        >
          <SafeIcon icon={FiDownload} className="mr-2 h-5 w-5" />
          Export PDF
        </button>
      </div>
    </motion.div>
  )
}

export default PayResult